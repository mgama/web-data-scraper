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
const runTest = analyzeDom(url);

// Use axios directly
async function analyzeDom(url:string) {
  const HTMLData = await axios.get(url);
  // console.log(HTMLData.data); //For debug only
  const dom = new JSDOM(HTMLData.data); //Read fetchedPage and convert it to a DOM that can be queried
  // const document = dom.window.document;
  console.log(JSON.stringify(dom.window.document.querySelector('a[href="/ref=nav_logo"]')));
  console.log(dom.window.document.querySelector('a[href="/ref=nav_logo"]'));
  const products: HTMLAnchorElement[] = Array.from(
    dom.window.document.querySelectorAll('div[data-component-type="s-search-result"]'),
  );
  console.log(products);
  interface singleProductData {
    productUrl: any,
    productPrice: any,
    productRating: any,
    productFastestDelivery: any
  };
  let slimProductsDataArray = new Array< singleProductData >;
  // WIP array of products with only data I need
  products.forEach((product) => {
    let singleProduct = {
      productUrl: product.querySelector('div[data-cy="title-recipe"] > h2 > a')?.getAttribute('href'), //link from product title
    // product.querySelector('span[data-component-type="s-product-image"] > a')?.getAttribute('href'), //link from product image
      productPrice: product.querySelector('span.a-price > span.a-offscreen')?.textContent?.replace('$',''), //works
      productRating: product.querySelector('i.a-icon.a-icon-star-small > span.a-icon-alt')?.textContent?.replace(' out of 5 stars',''), //works
      productFastestDelivery: product.querySelector('div[data-cy="delivery-recipe"] > div.a-row > div:nth-of-type(3) > span > span:nth-of-type(2)')?.textContent?.replace(/\D/g,'')
    };
    slimProductsDataArray.push(singleProduct);
    }
  );

  //Print out the new array of products with slimmed data
  slimProductsDataArray.forEach((product) => {
    console.log(JSON.stringify(product));
  })

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

async function findCheapestProduct() {
  // From the product container parent 
  // spawn.a-price > span.a-offscreen
  // Example value: $54.99
}

async function findHighestRatedProduct() {
  // From the product container parent 
  // i.a-icon.a-icon-star-small > span.a-icon-alt
  // Example value: 4.0 out of 5 stars
}

async function findEarliestDeliveryProduct() {
  // From the product container parent
  // span[aria-label="Or fastest delivery Mon, Mar 25 "] > span.a-color-base a-text-bold
  // Example value: Mon, Mar 25
}