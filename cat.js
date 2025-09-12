#!/usr/bin/env node

const args = require("command-line-parser");
const fs = require('fs');

const printFileContents = (filePath) => {
    const readStream = fs.createReadStream(filePath);
    readStream.on('data', (chunk) => {
        process.stdout.write(chunk);
    });
    readStream.on('end', () => {
        process.exit(0);
    });
    readStream.on('error', () => {
        process.exit(1);
    });
};

// TODO (12-9-25 @ 3:33 PM): implement POSIX compatibility
const main = (argc, argv) => {
    const filePath = argv[1];
    if (filePath) {
        printFileContents(filePath);
        return 0;
    }
    process.stdin.on('data', (data) => {
        process.stdout.write(data);
    });
    process.stdin.on('end', () => {
        process.exit(0);
    });
    return 0;
};

// we just have to call main() otherwise
// it will exit right away if we call it
// inside of process.exit
main(process.argv.length - 1, process.argv.slice(1));

