import puppeteer from 'puppeteer';
// const puppeteer = require('puppeteer');

let browser;
let page;

beforeAll(async () => {
  browser = await puppeteer.launch();
  page = await browser.newPage();
  await page.goto('http://localhost:3000');
});

afterAll(async () => {
  await browser.close();
});

test('home page loads 14 contact cards', async () => {
  const cards = await page.$$('#cards div.card');
  expect(cards.length).toBe(14);
});

test('1st card details for Naveed Fida', async () => {
  expect(await page.$eval('#cards div.card', node => node.firstElementChild.textContent)).toMatch(/Naveed Fida/);
});

test('add A new Name to Naveed Fida', async () => {
  await page.click('#card-1 div.editBtn');
  await page.waitForSelector('#edit form');
  await page.screenshot({
    path: 'test1.png'
  });
  await page.type('#editName', 'A new Name');
  await page.click('#edit [type="submit"]');
  expect(await page.$eval('#cards div.card', node => node.firstElementChild.textContent)).toMatch(/A new Name/);
});