const { checkAndWaitForRedirect, extractIssueName, delay } = require('./utils');

const log = console.log;

// readType - all images, quality - HD
const qualityAndTypeQuery = '&readType=1&quality=hq';

const imagesSelector = '#divImage p img';

/**
 * Navigates to a specific issue page and extracts all the images for this issue,
 * also tries to grab issue title from the page and returns an object containing this information
 * @param {Page} page
 * @param {String} pageUrl
 * @returns {Promise.<{images: Array.<String>, title: String}>}
 */
async function extractIssueImages(page, pageUrl) {
    log('Requesting issue page');
    await page.goto(pageUrl + qualityAndTypeQuery, {
        timeout: 2 * 60 * 1000 // big timeout b/c there can be a lot of images
    });

    await checkAndWaitForRedirect(page);

    const comicName = await extractIssueName(page);
    log(`Page ${comicName} ready`);

    const imagesUrls = await page.evaluate((sel) => {
        const issueImgElements = document.querySelectorAll(sel);

        if (!issueImgElements) {
            return [];
        }

        const images = [];
        issueImgElements.forEach(img => images.push(img.src));

        return images;

    }, imagesSelector);

    log('Images extracted');

    return {
        images: imagesUrls,
        title: comicName
    };
}

module.exports = extractIssueImages;
