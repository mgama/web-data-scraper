import axios from 'axios'; //This is used to make an http request to a url and retrieve the html data from it
import { JSDOM } from 'jsdom'; //This is used to transform the html data and be able to manipulate it as a regular dom

// To test out the function
let url = 'https://www.amazon.com/s?k=headphones&crid=VS7GDL0WY0ZR&sprefix=headphones%2Caps%2C522&ref=nb_sb_noss_2';
analyzeDom(url).then(result => console.log(result));

interface singleProductData {
  url: any,
  price: any,
  rating: any,
  deliveryDateValue: any,
};

//This function does the following: 
// - analyzes and retrieves the html data from a base url
// - generates an array named productsArray which contains only the product data we need to analyze
// - finally, it sends the productsArray to the findProducts function in order to retrieve the cheapest product, the highest rated product
// and the product with earliest delivery date
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
  
  // Get current year, day and month for scenarios where delivery date is displayed such as 'Today 5 PM - 10 PM'
  let currentYear = new Date().getFullYear().toString();
  let currentDay = new Date().getDate().toString();
  let currentMonth = (new Date().getMonth() + 1).toString();

  products.forEach((product) => {
    let url = 'https://www.amazon.com' + product.querySelector('div[data-cy="title-recipe"] > h2 > a')?.getAttribute('href'); //href value from product title
    let clickToSeePrice = product.querySelector('div[data-cy="price-recipe"] > div.a-row > a.a-link-normal > span.a-size-base-plus')?.textContent; //Example data value: Click to see price
    let price = product.querySelector('span.a-price > span.a-offscreen')?.textContent?.replace('$',''); //This removes the $ sign from price value. Example data value: 35.99
    let rating = product.querySelector('i.a-icon.a-icon-star-small > span.a-icon-alt')?.textContent?.replace(' out of 5 stars',''); //This removes text 'out of 5 stars' from product rating. Example data value: 4.3
    let fastestDelivery = product.querySelector('div[data-cy="delivery-recipe"] > div.a-row > div:nth-of-type(3) > span > span:nth-of-type(2)')?.textContent?.replace(',',''); //This removes ',' from Date. Example data value: Tue Mar 25
    let freeDelivery = product.querySelector('div[data-cy="delivery-recipe"] > div.a-row > span > span:nth-of-type(2)')?.textContent?.replace(',','');//This removes ',' from Date. Example data value: Tue Mar 25
    
    let deliveryDateToManipulate: any;
    let deliveryDateValue = 0;
    if (clickToSeePrice == 'Click to see price') {
      console.log('Found Click to see price, on product with url: ', url);
      console.log('setting product price to not available');
      price = 'price not available';
    }

    if (fastestDelivery == null || fastestDelivery == undefined) {
      console.log('No Fastest Delivery data was found, using Free Delivery data instead for product with url: ', url);
      console.log('Free Delivery data: ', freeDelivery);
      deliveryDateToManipulate = freeDelivery;
    } else {
      deliveryDateToManipulate = fastestDelivery;
    }

    // Edge case scenarios where Delivery Date is set as Today 5pm-10pm or Tomorrow 5pm-10pm
    if(deliveryDateToManipulate?.includes('Today') || deliveryDateToManipulate?.includes('Tomorrow')) {
      if (deliveryDateToManipulate?.includes('Today')){
        console.log('Detected Today as fastest Delivery, converting to date format');
        deliveryDateValue = Date.parse(currentMonth + ' ' + currentDay + ' ' + currentYear);
      }
      if (deliveryDateToManipulate?.includes('Tomorrow')){
        console.log('Detected Tomorrow as fastest Delivery, converting to date format');
        deliveryDateValue = Date.parse(deliveryDateToManipulate.replace('Tomorrow', '') + currentYear);
      }
    } else {
      deliveryDateValue = Date.parse(deliveryDateToManipulate + ' ' + currentYear);
    }

    let singleProduct = {
      url,
      price,
      rating, 
      deliveryDateValue
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

// This function performs the following:
// - receives a productsArray with all the products data to be analyzed
// - loops thru each one of the products and compares price, rating and delivery date
// in order to find the product with the lowest price, the product with the highest rating
// and the product with the earliest delivery date
// - In order to detect products with duplicated prices, ratings or delivery dates, it loops a second time
// thru the productsArray and finds the products (if they are more than 1 product with same value)
// - finally it returns an object that contains cheapestProductUrl, highestRatedProductUrl, earliestDeliveryProductUrl, in which
// each property can be a single url, or an array of multiple urls of products with duplicated found value (For example, same lowest price, 
// same highest rating or same early delivery date)
async function findProductUrls(productsArray: Array< singleProductData >) {
  let lowestPrice = productsArray[0].price;
  let highestRating = productsArray[0].rating;
  let earliestDeliveryDate = productsArray[0].deliveryDateValue;
  let indexOfCheapestProduct = 0;
  let indexOfHighestRatedProduct = 0;
  let indexOfFastestDeliveryProduct = 0;
  let multipleCheapProducts = new Array<number>;
  let multipleHighestRatedProducts = new Array<number>;
  let multipleFastestDeliveryProducts = new Array<number>;

  // First loop to determine lowestPrice, earliestDeliveryDate and highestRating
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
        if(keyValue.deliveryDateValue < earliestDeliveryDate){
          earliestDeliveryDate = keyValue.deliveryDateValue;
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

  // Second loop to determine duplicate values of possible multiple products
  // with identical cheapest price, identical highest rating or identical delivery date
  lowestPrice = productsArray[indexOfCheapestProduct].price;
  highestRating = productsArray[indexOfHighestRatedProduct].rating;
  earliestDeliveryDate = productsArray[indexOfFastestDeliveryProduct].deliveryDateValue;

  productsArray.forEach(function (keyValue, index, productsArray) {
    if(index > 0) {
      if(keyValue.price == lowestPrice){
        lowestPrice = keyValue.price;
        console.log('second loop, found duplicate lowestPrice', lowestPrice);
        multipleCheapProducts.push(index);
      }
      if(keyValue.deliveryDateValue == earliestDeliveryDate){
        earliestDeliveryDate = keyValue.deliveryDateValue;
        console.log('second loop, found duplicate earliestDeliveryDate', earliestDeliveryDate);
        multipleFastestDeliveryProducts.push(index);
      }
      if(keyValue.rating == highestRating) {
        highestRating = keyValue.rating;
        console.log('second loop, found duplicate highest rating', highestRating);
        multipleHighestRatedProducts.push(index);
      }
    }
  });

  let cheapestProductUrl: any;
  let highestRatedProductUrl: any;
  let earliestDeliveryProductUrl: any;
  // Build array values of multiple product urls if they are duplicates
  if(multipleCheapProducts.length > 0){
    let multipleCheapProductUrls = new Array<string>;
    multipleCheapProducts.forEach(function (element) {
        multipleCheapProductUrls.push(productsArray[element].url);
    })
    cheapestProductUrl = multipleCheapProductUrls;
  } else {
    cheapestProductUrl = productsArray[indexOfCheapestProduct].url
  }
  
  if (multipleHighestRatedProducts.length > 0){
    let multipleHighestRatedProductUrls = new Array<string>;
    multipleHighestRatedProducts.forEach(function (element) {
      multipleHighestRatedProductUrls.push(productsArray[element].url);
    })
    highestRatedProductUrl = multipleHighestRatedProductUrls;
  } else {
    highestRatedProductUrl = productsArray[indexOfHighestRatedProduct].url
  }

  if (multipleFastestDeliveryProducts.length > 0){
    let multipleFastestDeliveryProductUrls = new Array<string>;
    multipleFastestDeliveryProducts.forEach(function (element) {
      multipleFastestDeliveryProductUrls.push(productsArray[element].url);
    })
    earliestDeliveryProductUrl = multipleFastestDeliveryProductUrls;
  } else {
    earliestDeliveryProductUrl = productsArray[indexOfFastestDeliveryProduct].url
  }

  return { cheapestProductUrl, 
    highestRatedProductUrl,
    earliestDeliveryProductUrl,
  }
}

export default analyzeDom;