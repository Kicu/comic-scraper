const { promisify } = require('util');

const delay = promisify(setTimeout);

const waitForRedirectDelay = 7000;

async function getTitle(page) {
    return await page.evaluate(() => {
        const [title] = document.getElementsByTagName('title');

        return title.innerHTML;
    });
}

async function checkAndWaitForRedirect(page) {
    const title = await getTitle(page);

    if (title.startsWith('Please wait')) {
        return await delay(waitForRedirectDelay);
    }

    return true;
}

async function extractIssueName(page) {
    const title = await getTitle(page);

    const [comicName, issueNumber] = title
        .split(/\r?\n/)
        .filter(chunk => !chunk.match(/\t/) && Boolean(chunk))
        .map(chunk => chunk.trim());

    const issueName = `${comicName} - ${issueNumber}`;
    return issueName;
}


module.exports = {
    delay,
    checkAndWaitForRedirect,
    extractIssueName
};
