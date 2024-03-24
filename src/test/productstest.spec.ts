import analyzeDom from '../web-data-scraper';
import { expect } from 'chai';

describe("Test Product Finder", () => {
    it("Headphones Url test", () => {
        const testUrl = 'https://www.amazon.com/s?k=headphones&crid=VS7GDL0WY0ZR&sprefix=headphones%2Caps%2C522&ref=nb_sb_noss_2';
        return analyzeDom(testUrl).then((data) => {
            expect(data).to.be.an('object');
            expect(data).to.haveOwnProperty('cheapestProductUrl');
            expect(data).to.haveOwnProperty('highestRatedProductUrl');
            expect(data).to.haveOwnProperty('earliestDeliveryProductUrl');
        })
    });

    it("Gameboy Url test", () => {
        const testUrl = 'https://www.amazon.com/s?k=gameboy&crid=XFGXT3S9OY1E&sprefix=gameboy%2Caps%2C142&ref=nb_sb_noss_1';
        return analyzeDom(testUrl).then((data) => {
            expect(data).to.be.an('object');
            expect(data).to.haveOwnProperty('cheapestProductUrl');
            expect(data).to.haveOwnProperty('highestRatedProductUrl');
            expect(data).to.haveOwnProperty('earliestDeliveryProductUrl');
        })
    });
    
    it("Monitor stand Url test", () => {
        const testUrl = 'https://www.amazon.com/s?k=monitor+stand&crid=QULIWPGZ21G5&sprefix=monitor+stan%2Caps%2C136&ref=nb_sb_noss_2';
        return analyzeDom(testUrl).then((data) => {
            expect(data).to.be.an('object');
            expect(data).to.haveOwnProperty('cheapestProductUrl');
            expect(data).to.haveOwnProperty('highestRatedProductUrl');
            expect(data).to.haveOwnProperty('earliestDeliveryProductUrl');
        })
    })
})