const { checkAndWaitForRedirect, extractIssueName, delay } = require('./utils');

const log = console.log;

// readType - all images, quality - HD
const qualityAndTypeQuery = '&readType=1&quality=hq';

// selectors
const imagesSelector = '#divImage p img';
const imagesLoaderSelector = '#imgLoader';

const waitForImagesDelay = 3000;

function checkIfImagesLoaded(loaderSelector) {
    const imageLoader = document.querySelector(loaderSelector);
    const imageLoaderStyles = imageLoader && imageLoader.style;

    return (imageLoaderStyles.getPropertyValue('display') === 'none');
}

/**
 * Navigates to a specific issue page and extracts all the images for this issue,
 * also tries to grab issue title from the page and returns an object containing this information
 * @param {Page} page
 * @param {String} pageUrl
 * @returns {Promise.<{images: Array.<String>, title: String}>}
 */
async function extractIssueImages(page, pageUrl) {
    log(`Requesting issue: ${pageUrl}`);
    await page.goto(pageUrl + qualityAndTypeQuery, {
        timeout: 3 * 60 * 1000, // big timeout b/c there can be a lot of images,
        waitUntil : 'networkidle2'
    });

    await checkAndWaitForRedirect(page);

    const comicName = await extractIssueName(page);
    log(`Page ${comicName} ready`);

    // run a loop checking if script that loads images finished and images are loaded
    let imagesLoaded = false;
    while (!imagesLoaded) {
        imagesLoaded = await page.evaluate(checkIfImagesLoaded, imagesLoaderSelector);

        if (!imagesLoaded) {
            console.log('Waiting for images...');
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            await delay(waitForImagesDelay);
        }
    }


    const imagesUrls = await page.evaluate((imgSel) => {
        const issueImgElements = document.querySelectorAll(imgSel);

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
