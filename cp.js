#!/usr/bin/env node

const VERSION = "0.0.0";
const SCRIPT_VERSION = "0.1.0";

const args = require("command-line-parser")({
    args: process.argv.slice(1),   // skip node
    allowEmbeddedValues: true,
    allowKeyGrouping: true
});

const fs = require('fs');

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

// ---- ACTUAL PROGRAM FUNCTIONS BEGIN HERE ---- //
const cp = (src, dst) => {
    try {
        fs.copyFileSync(src, dst);
    } catch (err) {
        console.error(`${args._args[0]}:`, err);
        return -1;
    }
    return 0;
};

const main = () => {
    const bs = function(s) {
        let x = s.split('/').filter(s => s);
        return x[x.length - 1];
    };

    const scriptName = bs(process.argv.slice(1)[0]);
    switch (process.argv.slice(1).length) {
        case 1:
            console.error(`${scriptName}:`, "missing file name");
            console.error(`Run ${scriptName} --help for more information.`);
            process.exit(-1);
        case 2:
            if (args) break;
            console.error(`${scriptName}:`, "missing destination");
            console.error(`Run ${scriptName} --help for more information.`);
            process.exit(-1);
    }

    if (args.help) {
        let usageInBold = returnPrettyString("Usage", Color.Default, true);
        console.log(`${usageInBold}:`, `${scriptName} <options> [SOURCE] [DEST]`);
        console.log("Copies SOURCE file to DEST.");
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
    

    const possibleFiles = args._args.slice(1);

    // scenario 1: we are copying two files
    if (possibleFiles.length == 2) {
        const src, dest;
        src = possibleFiles[0];
        dest = possibleFiles[1];
        process.exit(cp(src, dest));
    }

    // scenario 2: we are copying many files
    if (possibleFiles.length > 2) {
        // we copy everything but the last item to the last item,
        // assuming last item is a directory
        const isDir = function(dir) {
            try {
                const s = fs.statSync(dir);
                return s.isDirectory();
            } catch (err) {
                console.error(`${scriptName}:`, err);
                process.exit(err.errno);
            }
        };
        
        const dest = possibleFiles[possibleFiles.length - 1];
        if (!isDir(dest)) {
            console.error(`${scriptName}:`, `${dest}:`, "not a directory");
            process.exit(-1);\
        }

        // TODO (12.9 @ 10:01 PM): implement the rest ;3
    }
};

main();
