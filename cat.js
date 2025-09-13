#!/usr/bin/env node

const VERSION = "0.0.0";
const SCRIPT_VERSION = "0.1.0";

const args = require("command-line-parser")({
    args: process.argv.slice(1),   // skip node
    allowEmbeddedValues: true,
    allowKeyGrouping: true
});

const fs = require('fs');
const path = require('path');

// derived from basename.js
// only has what we need
const Color = {
    Default: 39,
    White: 37,
};

const gap = (n) => {
    for (var _ = 0; _ < n; _++)
        console.log();
};

const returnPrettyString = (txt, color, bold) => {
    if (bold) return `\x1b[1;${color}m${txt}\x1b[0m`;
    return `\x1b[0;${color}m${txt}\x1b[0m`;
};

const description = (x, y) => {
    let a = function() {
        if (Array.isArray(x)) {
            if (x[0] === undefined) x = x[x.length - 1];
            const doubleArgs = x.toString().replace(',', ', ');
            return returnPrettyString(doubleArgs, Color.White, true);
        } else {
            return returnPrettyString(x, Color.White, true);
        }
    };
    let b = returnPrettyString(y, Color.Default, false);
    console.log(`\t${a()}\n\t${b}\n`);
};

const readFileSyncAndPrint = (filename) => {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        process.stdout.write(data);
        return 0;
    } catch (err) {
        console.error(`${path.basename(process.argv[1])}: ${filename}: ${err.message}`);
        return 1;
    }
};

const main = () => {
    const scriptName = path.basename(process.argv[1]);
    const files = args._args.slice(1);

    if (args.help) {
        let usageInBold = returnPrettyString("Usage", Color.Default, true);
        console.log(`${usageInBold}:`, `${scriptName} <options> [FILE ...]`);
        console.log("Concatenate FILE(s) to standard output.");
        gap(1);
        console.log("Possible options:");
        description(["-V", "--version"], "Print version of this program and leave");
        description([(undefined), "--help"], "Print this message and leave");
        gap(1);
        console.log(`nodejs-posix-utilities ${VERSION}; ${scriptName} ${SCRIPT_VERSION}`);
        process.exit(0);
    }

    if (args.V || args.version) {
        console.log(`nodejs-posix-utilities ${VERSION}; ${scriptName} ${SCRIPT_VERSION}`);
        process.exit(0);
    }

    if (files.length === 0) {
        // read from stdin
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', chunk => {
            process.stdout.write(chunk);
        });
        process.stdin.on('end', () => {});
        // user must Ctrl+D
    } else {
        let exitCode = 0;
        for (const file of files) {
            if (file === '-') {
                // read from stdin if '-' is given as a filename
                process.stdin.setEncoding('utf8');
                process.stdin.on('data', chunk => {
                    process.stdout.write(chunk);
                });
                process.stdin.on('end', () => {});
            } else {
                const code = readFileSyncAndPrint(file);
                if (code !== 0) exitCode = code;
            }
        }
        process.exit(exitCode);
    }
};

main();

