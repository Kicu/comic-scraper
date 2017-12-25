const path = require('path');
const fs = require('fs');

const archiver = require('archiver');

const log = console.log;

function checkIfDirectoryNonEmpty(dirName) {
    return new Promise((resolve) => {
        fs.readdir(dirName, function(err, files) {
            if (err) {
                resolve(false);
            } else {
                resolve(files.length);
            }
        });
    });
}

async function zipImages(dirsList, basePath) {
    for (const dirName of dirsList) {
        // skip zipping empty dirs
        const dirNotEmpty = await checkIfDirectoryNonEmpty(dirName);
        if (!dirNotEmpty) {
            continue;
        }

        const output = fs.createWriteStream(path.join(basePath, `${dirName}.cbz`));

        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        // good practice to catch this error explicitly
        archive.on('error', function(err) {
            throw err;
        });

        archive.pipe(output);
        archive.directory(path.join(basePath, dirName));

        archive.finalize();
    }
}

module.exports = zipImages;
