import axios from 'axios';
import { JSDOM } from 'jsdom';

// First implementations
// // async function fetchPage(url: string): Promise<string | undefined> {
// async function fetchPage(url: string) {
//   const HTMLData = await axios
//     .get(url)
//     .then(res => res.data)
//     .catch((error) => {
//       console.error(`There was an error with ${error.config.url}.`);
//       console.error(error.toJSON());
//     });
//   console.log(HTMLData);
//   const dom = new JSDOM(HTMLData); //Read fetchedPage and convert it to a DOM that can be queried
//   const document = dom.window.document;
//   console.log(JSON.stringify(document.querySelector('div[data-component-type="s-search-result"]')));
//   return HTMLData;
// }

// async function analyzeHtmlData(HTMLData: string) {
//   const dom = new JSDOM(HTMLData); //Read fetchedPage and convert it to a DOM that can be queried
//   const document = dom.window.document;
//   console.log(JSON.stringify(document.querySelector('div[data-component-type="s-search-result"]')));
//   return document;
// }

let url = 'https://www.amazon.com/s?k=headphones&crid=VS7GDL0WY0ZR&sprefix=headphones%2Caps%2C522&ref=nb_sb_noss_2';
// let url = 'https://www.amazon.com/s?k=mouse+pad&crid=2PPZPC91NM6GQ&sprefix=mouse+pad%2Caps%2C124&ref=nb_sb_noss_1';
// const fetchedPage = fetchPage(url);
// const dom = analyzeHtmlData(fetchedPage);
// console.log('Result', result);
const productsArrayResult = analyzeDom(url);
// const cheapestProduct = findCheapestProduct(productsArrayResult);

interface singleProductData {
  url: any,
  price: any,
  rating: any,
  fastestDelivery: any
};

// Use axios directly
// async function analyzeDom(url:string) : Promise<singleProductData[]>{
async function analyzeDom(url:string) {
  const HTMLData = await axios.get(url);
  // console.log(HTMLData.data); //For debug only
  const dom = new JSDOM(HTMLData.data); //Read fetchedPage and convert it to a DOM that can be queried
  const products: HTMLAnchorElement[] = Array.from(
    dom.window.document.querySelectorAll('div[data-component-type="s-search-result"]'),
  );
  console.log(products);
  
  let slimProductsDataArray = new Array< singleProductData >;
  // WIP array of products with only data I need
  products.forEach((product) => {
    let singleProduct = {
      url: 'https://www.amazon.com' + product.querySelector('div[data-cy="title-recipe"] > h2 > a')?.getAttribute('href'), //link from product title
      clickToSeePrice: product.querySelector('div[data-cy="price-recipe"] > div.a-row > a.a-link-normal > span.a-size-base-plus')?.textContent,
      price: product.querySelector('span.a-price > span.a-offscreen')?.textContent?.replace('$',''), //works
      rating: product.querySelector('i.a-icon.a-icon-star-small > span.a-icon-alt')?.textContent?.replace(' out of 5 stars',''), //works
      fastestDelivery: product.querySelector('div[data-cy="delivery-recipe"] > div.a-row > div:nth-of-type(3) > span > span:nth-of-type(2)')?.textContent?.replace(/\D/g,'')
    };
    if (singleProduct.clickToSeePrice == 'Click to see price') {
      console.log('Found Click to see price, on product with url: ', singleProduct.url);
      console.log('setting product price to not available');
      singleProduct.price = 'price not available';
    }
    slimProductsDataArray.push(singleProduct);
    }
  );

  // return slimProductsDataArray;

  //Print out the new array of products with slimmed data
  // slimProductsDataArray.forEach((product) => {
  //   console.log(JSON.stringify(product));
  // })

  // let min = Math.min.apply(Math, slimProductsDataArray.map(i => i.price)); 
  await findCheapestProduct(slimProductsDataArray);
  await findHighestRatedProduct(slimProductsDataArray);
  await findEarliestDeliveryProduct(slimProductsDataArray);

  // //This works
  // products.forEach((product) => console.log(
  //   product.querySelector('div[data-cy="title-recipe"] > h2 > a')?.getAttribute('href'), //link from product title
  //   product.querySelector('span[data-component-type="s-product-image"] > a')?.getAttribute('href'), //link from product image
  //   product.querySelector('span.a-price > span.a-offscreen')?.textContent, //works
  //   product.querySelector('i.a-icon.a-icon-star-small > span.a-icon-alt')?.textContent, //works
  //   product.querySelector('div[data-cy="delivery-recipe"] > div.a-row > div:nth-of-type(3) > span > span:nth-of-type(2)')?.textContent
  //   )
  // );
}


// var deliverydate = productContainer.querySelector('div[data-cy="delivery-recipe"] > div.a-row > div:nth-of-type(3) > span > span:nth-of-type(2)')


// DOM Selectors to fin the product containers
// var products = document.querySelectorAll('div[data-component-type="s-search-result"]');

async function findCheapestProduct(productsArray: Array< singleProductData >) {
  // From the product container parent 
  // spawn.a-price > span.a-offscreen
  // Example value: $54.99

  console.log('From the findCheapestProduct function');
  productsArray.forEach((product) => {
    console.log(JSON.stringify(product));
  })

  let lowestNumber = productsArray[0].price;
  // let highestNumber = productsArray[0].price;
  let indexOfCheapestProduct = 0;

  productsArray.forEach(function (keyValue, index, productsArray) {
    if(index > 0) {
      if (keyValue.price === 'price not available') { 
        //This is to prevent a product that has no visible price
        // and is showing 'Click to see price'
        // Skipping this product
        console.log('Cannot analyze price of product with url since price is hidden', keyValue.url);
      } else {
        if(keyValue.price < lowestNumber){
          lowestNumber = keyValue.price;
          console.log('in loop lowest number', lowestNumber);
          indexOfCheapestProduct = index;
        }
        // if(keyValue.price > highestNumber) {
        //   highestNumber = keyValue.price;
        // }
      }
    }
  });
  console.log('lowest number' , lowestNumber);
  console.log('the url of the cheapest product is', productsArray[indexOfCheapestProduct].url)
  // console.log('highest Number' , highestNumber);
}

async function findHighestRatedProduct(productsArray: Array< singleProductData >) {
  // From the product container parent 
  // i.a-icon.a-icon-star-small > span.a-icon-alt
  // Example value: 4.0 out of 5 stars

  console.log('From the findHighestRatedProduct function');
  // productsArray.forEach((product) => {
  //   console.log(JSON.stringify(product));
  // })

  // let lowestNumber = productsArray[0].rating;
  let highestNumber = productsArray[0].rating;
  let indexOfHighestRatedProduct = 0;

  productsArray.forEach(function (keyValue, index, productsArray) {
    if(index > 0) {
      // if(keyValue.rating < lowestNumber){
      //   lowestNumber = keyValue.rating;
      //   console.log('in loop lowest rating', lowestNumber);
      // }
      if(keyValue.rating > highestNumber) {
        highestNumber = keyValue.rating;
        console.log('in loop highest rating', highestNumber);
        indexOfHighestRatedProduct = index;
      }
    }
  });
  // console.log('lowest rating' , lowestNumber);
  console.log('highest rating' , highestNumber);
  console.log('the url of the highest rated product is', productsArray[indexOfHighestRatedProduct].url)
}

async function findEarliestDeliveryProduct(productsArray: Array< singleProductData >) {
  // From the product container parent
  // span[aria-label="Or fastest delivery Mon, Mar 25 "] > span.a-color-base a-text-bold
  // Example value: Mon, Mar 25

  console.log('From the findEarliestDeliveryProduct function');
  // productsArray.forEach((product) => {
  //   console.log(JSON.stringify(product));
  // })

  let lowestNumber = productsArray[0].fastestDelivery;
  // let highestNumber = productsArray[0].price;
  let indexOfFastestDeliveryProduct = 0;

  productsArray.forEach(function (keyValue, index, productsArray) {
    if(index > 0) {
      if (keyValue.fastestDelivery === null) { 
        //This is to prevent a product that has no visible price
        // and is showing 'Click to see price'
        // Skipping this product
        console.log('Cannot analyze price of product with url since price is null', keyValue.url);
      } else {
        if(keyValue.fastestDelivery < lowestNumber){
          lowestNumber = keyValue.fastestDelivery;
          console.log('in loop lowest number', lowestNumber);
          indexOfFastestDeliveryProduct = index;
        }
        // if(keyValue.price > highestNumber) {
        //   highestNumber = keyValue.price;
        // }
      }
    }
  });
  console.log('lowest number or faster delivery' , lowestNumber);
  console.log('the url of the cheapest product is', productsArray[indexOfFastestDeliveryProduct].url)
}