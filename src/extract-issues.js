const { checkAndWaitForRedirect } = require('./utils');

const issueListSelector = '.listing tbody tr';

/**
 * Navigates to the comic page and extracts all comic issues from the page, returns an array of urls to the issues
 * @param {Page} page
 * @param {String} pageUrl
 * @returns {Promise.<Array.<String>>}
 */
async function extractIssues(page, pageUrl) {
    await page.goto(pageUrl);

    await checkAndWaitForRedirect(page);

    const issueList = await page.evaluate((sel) => {
        const comicListRows = document.querySelectorAll(sel);

        if (!comicListRows) {
            return [];
        }

        const comicIssueUrls = [];

        let i = 0;
        for (const comicListRow of comicListRows.values()) {
            // Drop the first 2 elements of the list as they are irrelevant
            if (i < 2) {
                i++;
                continue;
            }

            const comicListRowCells = comicListRow.childNodes;
            if (comicListRowCells.length !== 5) {
                continue;
            }

            const comicListRowLinkCell = comicListRowCells[1];

            // Extract `a` element
            const comicIssueUrl = comicListRowLinkCell.childNodes[1] && comicListRowLinkCell.childNodes[1].href;
            comicIssueUrls.push(comicIssueUrl)
        }

        return comicIssueUrls.filter(Boolean);

    }, issueListSelector);

    return issueList;
}

module.exports = extractIssues;
