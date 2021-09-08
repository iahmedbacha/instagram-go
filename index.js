require('dotenv').config();
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra');

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const refresh = parseInt(process.env.REFRESH, 10);

// puppeteer usage as normal
(async () => {
  try {
    // open the headless browser
    const browser = await puppeteer.launch({ headless: false });
    // open a new page
    const page = await browser.newPage();
    // script
    await page.goto(`https://instagram.com/`);
    // username
    await page.waitForSelector("input[name=username]");
    const username = process.env.USERNAME;
    await page.focus('input[name=username]');
    await page.keyboard.type(username);
    // password
    await page.waitForSelector("input[name=password]");
    const password = process.env.PASSWORD;
    await page.focus('input[name=password]');
    await page.keyboard.type(password);
    // login
    await page.keyboard.press('Enter');
    await page.waitForNavigation();
    await page.goto(`https://instagram.com/` + username);
    await page.waitForSelector(".g47SY");
    let followersCurrent = await page.evaluate(
      () => document.querySelectorAll('.g47SY')[1].textContent
    );
    // loop
    const script = setInterval(async () => {
      await page.goto(`https://instagram.com/` + username);
      await page.waitForSelector(".g47SY");
      let followersNext = await page.evaluate(
        () => document.querySelectorAll('.g47SY')[1].textContent
      );
      if (followersCurrent !== followersNext) {
        // update bio
        await page.goto(`https://www.instagram.com/accounts/edit/`);
        await page.waitForSelector("#pepBio");
        await page.evaluate( () => document.getElementById("pepBio").value = "");
        await page.focus('#pepBio');
        await page.keyboard.type(process.env.PREFIX);
        if (followersNext == "0" || followersNext == "1") {
          await page.keyboard.type("This account has: " + followersNext + " follower.");
        }
        else {
          await page.keyboard.type("This account has: " + followersNext + " followers.");
        }
        await page.keyboard.type(process.env.POSTFIX);
        followersCurrent = followersNext;
        await page.click('.sqdOP.L3NKy.y3zKF');
        await page.waitForSelector(".gxNyb");
      }
    }, refresh);
  }
  catch (err) {
    console.log("Warning: possible timeout has occured, program still running.");
  }
})();
