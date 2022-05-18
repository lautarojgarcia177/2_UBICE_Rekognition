/**
 * when done, ensure to call endProcess() to stop the process.
 */

const exiftool = require('node-exiftool')
const exiftoolBin = require('dist-exiftool')
const ep = new exiftool.ExiftoolProcess(exiftoolBin)

class ExifTool {
    isOpen = false;

    async readMetadata(imageFileName) {
        if (!this.isOpen) {
            await ep.open();
            this.isOpen = true;
        }
        await ep.readMetadata(imageFileName, ['-File:all']);
    }

    async addKeywords(imageFileName, keywords) {
        debugger;
        if (!this.isOpen) {
            await ep.open();
            this.isOpen = true;
        };
        await ep.writeMetadata(imageFileName, {
            'Keywords+': [...keywords],
        }, ['overwrite_original']);
    }

    async endProcess() {
        if (this.isOpen) {
            await ep.close();
            this.isOpen = false;
        }
    }
}

module.exports = new ExifTool();
