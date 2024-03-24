This is test exercise to do a web scrap of data from a url in order to retrieve the cheapest product, the product with the highest rating and the product that will be delivered the earliest

As an input, a product search url is needed

The main script can be found here: src/web-data-scraper.ts

Requirements
- Nodejs environment
- Typescript and ts-node should be installed globally

Installation
- npm install

To run the main script
- ts-node src/web-data-scraper.ts

To run the mocha tests
- npm test

Edge case scenarios to note:
- Some products do not show price. In the code, the products with no visible price are discarded from the calculations
- Some products do not have delivery date. In the code, the products with no delivery date are discarded from the calculations
- What to return if 2 or more products have the same early delivery date? Current implementation returns all the products urls with the same early delivery date
- What to return if 2 or more products have the same lowest price? Current implementation returns all the product urls with the same lowest price
- What to return if 2 or more products have the same star rating? Current implementation returns all the product urls with the same highest rating. For future use, should it count the number of user ratings in total and then use that data to return the one with the highest star rating and the highest user ratings count number?