const path = require('path');

const puppeteer = require('puppeteer');

const extractIssues = require('./src/extract-issues');
const extractIssueImages = require('./src/extract-issue-images');
const downloadImages = require('./src/download-images');
const zipImages = require('./src/zip-images');
const { delay } = require('./src/utils');

const pageUrl = 'http://readcomiconline.to/Comic/Dark-Reign-Fantastic-Four';

(async () => {
    // Prepare browser instance
    const browser = await puppeteer.launch({
        headless: true,
        timeout: 0
    });

    const page = await browser.newPage();

    const issueList = await extractIssues(page, pageUrl);

    // Change order to oldest first
    issueList.reverse();

    const [first, ...restIssues] = issueList;

    const savedDirectories = [];
    for (const issueUrl of restIssues) {
        try {
            const { images, title } = await extractIssueImages(page, issueUrl);

            const savedDir = await downloadImages(images, title);
            savedDirectories.push(savedDir);

            await delay(900);
        } catch (err) {
            console.trace(err);
        }
    }

    await browser.close();

    // Zip folders into cbz
    await zipImages(savedDirectories, path.join(__dirname, '.'));
})();
