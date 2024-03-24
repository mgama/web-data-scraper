This is test exercise to do a web scrap of data from a url in order to retrieve the cheapest product, the product with the highest rating and the product that will be delivered the earliest

As an input, a product search url is needed

Requirements
- Nodejs environment
- Typescript and ts-node should be installed globally

Installation
- npm install

To run the test
- ts-node web-data-scraper.ts

Edge case scenarios to fix:
- Some products do not show price. In the code, the products with no visible price are discarded from the calculations
- Some products do not have delivery date. In the code, the products with no delivery date are discarded from the calculations
- What to return if 2 or more products have the same early delivery date? Should it return all the products urls with the same early delivery date?
- What to return if 2 or more products have the same lowest price? Should it return all the product urls with the same lowest price?
- What to return if 2 or more products have the same star rating? Should it count the number of user ratings in total and then use that data to return the one with the highest star rating and the highest user ratings count number?