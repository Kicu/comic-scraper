const path = require('path');
const fs = require('fs');

const archiver = require('archiver');

const log = console.log;

async function zipImages(dirsList, basePath) {
    for (const dirName of dirsList) {
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
