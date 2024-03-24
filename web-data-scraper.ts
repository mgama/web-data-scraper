import axios from 'axios'; //This is used to make an http request to a url and retrieve the html data from it
import { JSDOM } from 'jsdom'; //This is used to transform the html data and be able to manipulate it as a regular dom

// To test out the function
let url = 'https://www.amazon.com/s?k=headphones&crid=VS7GDL0WY0ZR&sprefix=headphones%2Caps%2C522&ref=nb_sb_noss_2';
analyzeDom(url).then(result => console.log(result));

interface singleProductData {
  url: any,
  clickToSeePrice: any,
  price: any,
  rating: any,
  fastestDelivery: any
  freeDelivery: any,
};

async function analyzeDom(url:string) {
  //Make an http request to the url and retrieve the html data
  const HTMLData = await axios.get(url);
  // console.log(HTMLData.data); //For debug only
  const dom = new JSDOM(HTMLData.data); //Read fetchedPage and convert it to a DOM that can be queried
  const products: HTMLAnchorElement[] = Array.from(
    dom.window.document.querySelectorAll('div[data-component-type="s-search-result"]'),//This is the selector for the product containers
  );
  // console.log(products);//For debug
  
  //Create an array of products data to analyze
  let slimProductsDataArray = new Array< singleProductData >;
  products.forEach((product) => {
    let singleProduct = {
      url: 'https://www.amazon.com' + product.querySelector('div[data-cy="title-recipe"] > h2 > a')?.getAttribute('href'), //href value from product title
      clickToSeePrice: product.querySelector('div[data-cy="price-recipe"] > div.a-row > a.a-link-normal > span.a-size-base-plus')?.textContent, //Example data value: Click to see price
      price: product.querySelector('span.a-price > span.a-offscreen')?.textContent?.replace('$',''), //This removes the $ sign from price value. Example data value: 35.99
      rating: product.querySelector('i.a-icon.a-icon-star-small > span.a-icon-alt')?.textContent?.replace(' out of 5 stars',''), //This removes text 'out of 5 stars' from product rating. Example data value: 4.3
      fastestDelivery: product.querySelector('div[data-cy="delivery-recipe"] > div.a-row > div:nth-of-type(3) > span > span:nth-of-type(2)')?.textContent?.replace(/\D/g,''), //This removes day and month data from Date. Example data value: 25
      freeDelivery: product.querySelector('div[data-cy="delivery-recipe"] > div.a-row > span > span:nth-of-type(2)')?.textContent?.replace(/\D/g,'')//This removes day and month data from Date. Example data value: 25
    };
    if (singleProduct.clickToSeePrice == 'Click to see price') {
      console.log('Found Click to see price, on product with url: ', singleProduct.url);
      console.log('setting product price to not available');
      singleProduct.price = 'price not available';
    }
    if (singleProduct.fastestDelivery == null || singleProduct.fastestDelivery == undefined) {
      console.log('No Fastest Delivery data was found, using Free Delivery data instead for product with url: ', singleProduct.url);
      console.log('Free Delivery data: ', singleProduct.freeDelivery);
      singleProduct.fastestDelivery = singleProduct.freeDelivery;
    }
    slimProductsDataArray.push(singleProduct);
    }
  );

  //Print out the new array of products with slimmed data for debug
  slimProductsDataArray.forEach((product) => {
    console.log(JSON.stringify(product));
  })

  //Proceed to find all the product Urls for the Cheapest Product, the Highest rated product and the Product with earliest delivery
  let findProducts = await findProductUrls(slimProductsDataArray);
  return findProducts;
}

async function findProductUrls(productsArray: Array< singleProductData >) {
  let lowestPrice = productsArray[0].fastestDelivery;
  let highestRating = productsArray[0].rating;
  let earliestDeliveryDate = productsArray[0].fastestDelivery;
  let indexOfCheapestProduct = 0;
  let indexOfHighestRatedProduct = 0;
  let indexOfFastestDeliveryProduct = 0;
  productsArray.forEach(function (keyValue, index, productsArray) {
    if(index > 0) {
      if (keyValue.price === 'price not available') { 
        //This is to prevent a product that has no visible price
        // and is showing 'Click to see price'
        // Skipping this product from the analysis
        console.log('Cannot analyze price of product with url since price is hidden', keyValue.url);
      } else {
        if(keyValue.price < lowestPrice){
          lowestPrice = keyValue.price;
          console.log('in loop lowestPrice', lowestPrice);
          indexOfCheapestProduct = index;
        }
        if(keyValue.fastestDelivery < earliestDeliveryDate){
          earliestDeliveryDate = keyValue.fastestDelivery;
          console.log('in loop earliestDeliveryDate', earliestDeliveryDate);
          indexOfFastestDeliveryProduct = index;
        }
        if(keyValue.rating > highestRating) {
          highestRating = keyValue.rating;
          console.log('in loop highest rating', highestRating);
          indexOfHighestRatedProduct = index;
        }
      }
    }
  });
  return { cheapestProductUrl: productsArray[indexOfCheapestProduct].url, 
    highestRatedProductUrl: productsArray[indexOfHighestRatedProduct].url,
    earliestDeliveryProductUrl: productsArray[indexOfFastestDeliveryProduct].url
  }
}