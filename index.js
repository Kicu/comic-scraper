const path = require('path');

const puppeteer = require('puppeteer');

const extractIssues = require('./src/extract-issues');
const extractIssueImages = require('./src/extract-issue-images');
const downloadImages = require('./src/download-images');
const zipImages = require('./src/zip-images');
const { delay } = require('./src/utils');

async function downloadComic(browser, comicPageUrl, issuePageUrl) {
    const page = await browser.newPage();

    let issueList;
    if (issuePageUrl) {
        issueList = [issuePageUrl];
    } else {
        issueList = await extractIssues(page, comicPageUrl);

        // Change order to oldest first
        issueList.reverse();
    }

    const savedDirectories = [];
    const failedIssues = [];
    for (const issueUrl of issueList) {
        try {
            const { images, title } = await extractIssueImages(page, issueUrl);

            const dirName = path.join('.', 'comics', title);
            const savedDir = await downloadImages(images, dirName);

            if (!savedDir) {
                failedIssues.push({ images, title });
            }
            savedDirectories.push(savedDir);

            await delay(900);
        } catch (err) {
            console.trace(err);
        }
    }

    // retry failed downloads
    if (failedIssues.length) {
        console.log('Retrying failed downloads');
        for (const { images, title } of failedIssues) {
            try {
                const dirName = path.join('.', 'comics', title);
                const savedDir = await downloadImages(images, dirName);

                savedDirectories.push(savedDir);

                await delay(900);
            } catch (err) {
                console.trace(err);
            }
        }
    }

    await browser.close();

    // Zip folders into cbz
    await zipImages(savedDirectories.filter(Boolean), path.join(__dirname));
}

(async () => {
    // Prepare browser instance
    const browser = await puppeteer.launch({
        headless: true,
        timeout: 0
    });

    await downloadComic(browser, '');
})();