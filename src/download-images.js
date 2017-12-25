const path = require('path');
const fs = require('fs');

const fetch = require('node-fetch');

const log = console.log;

const filenameRegex = /filename="(\w+.(jpg|png|jpeg))"/;
const retryImageRequestCount = 3;

/**
 * Try to get name for file, using in order
 * 1. name from file url if possible
 * 2. filename from response headers if exists
 * 3. just use the provided number if needed
 */
function getFilename(imgUrl, headers, number) {
    const [fileName] = imgUrl.split('/').reverse();

    if (fileName.match(/(\.jpg|\.png)/)) {
        return fileName;
    }

    // If no proper image name in url, try to extract it from headers
    const contentDispositionHeader = headers.get('Content-Disposition') || '';
    const extractedFilename = contentDispositionHeader.match(filenameRegex);

    // If regex was matched the name will be in 1st capture group
    return extractedFilename ? extractedFilename[1] : `${number}.jpg`;
}

async function requestAndSaveFile(imgUrl, basePath, num) {
    const res = await fetch(imgUrl);

    let fileName = getFilename(imgUrl, res.headers, num);

    const filePath = path.join('.', basePath, fileName);
    const fileStream = fs.createWriteStream(filePath);

    res.body.pipe(fileStream);

    return fileName;
}

/**
 * Iterates over an array of img urls and downloads and saves them to a specified directory
 * @param {Array.<String>} imgUrlList
 * @param {String} dirName
 * @returns {Promise.<String>}
 */
async function downloadImages(imgUrlList, dirName) {
    // Check and create directory
    if (!fs.existsSync(dirName)){
        fs.mkdirSync(dirName);
    }

    for (let i = 0; i < imgUrlList.length; i++) {
        const imgUrl = imgUrlList[i];
        let j = 0;

        while(j < retryImageRequestCount) {
            try {
                log(`Requesting ${imgUrl}`);
                const savedFileName = await requestAndSaveFile(imgUrl, dirName, i);
                log(`${savedFileName} succesfully saved`);
                j = 99; // cut off further retrying
            } catch (err) {
                log(`Error: ${err}`);
                log(`Retry attempt #${++j}`);
            }
        }
    }

    return dirName;
}

module.exports = downloadImages;
