const puppeteer = require('puppeteer');
const { expect } = require('chai');
describe('Толық интеграциялық тест (End-to-End)', function () {
    this.timeout(30000);
    let browser;
    let page;
    before(async function () {
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });
        page = await browser.newPage();
    });
    after(async function () {
        await browser.close();
    });
    it('1. Басты бетке кіру', async function () {
        await page.goto('http://localhost:5173/');
        const title = await page.title();
        expect(title).to.include('Qadam');
        console.log('✔ Басты бет сәтті ашылды');
    });
    it('2. Тіркелу бетіне өту', async function () {
        await page.goto('http://localhost:5173/register');
        await page.waitForSelector('form');
        const formExists = await page.$('form');
        expect(formExists).to.not.be.null;
        console.log('✔ Тіркелу бетіне сәтті өтті');
    });
    it('3. Форманы толтыру', async function () {
        await page.waitForSelector('input[placeholder="Аты-жөніңіз"]');
        const testUser = `testuser_${Date.now()}`;
        const testEmail = `${testUser}@example.com`;
        const testPassword = 'password123';
        await page.type('input[placeholder="Аты-жөніңіз"]', testUser);
        await page.type('input[placeholder="Email"]', testEmail);
        await page.type('input[placeholder="Құпиясөз"]', testPassword);
        await page.type('input[placeholder="Құпиясөзді растау"]', testPassword);
        await new Promise(r => setTimeout(r, 1000));
        console.log('✔ Форма сәтті толтырылды');
    });
    it('4. Жіберу (Submit)', async function () {
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => { }),
            page.click('button[type="submit"]')
        ]);
        const currentUrl = page.url();
        expect(currentUrl).to.not.include('/register');
        console.log('✔ Тіркелу сәтті аяқталып, жіберілді');
    });
});