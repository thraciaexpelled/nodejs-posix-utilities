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
const cp = (src, dst, recursiveCopy = false) => {
    try {
        const path = require('path');
        const srcStat = fs.statSync(src);
        
        // check if destination exists and what type it is
        let dstStat;
        try {
            dstStat = fs.statSync(dst);
        } catch (err) {
            // destination doesn't exist, treat as file
            dstStat = null;
        }
        
        if (dstStat && dstStat.isDirectory()) {
            // destination is a directory, construct the full path
            const srcBasename = path.basename(src);
            const fullDstPath = path.join(dst, srcBasename);
            
            if (srcStat.isDirectory()) {
                // source is a directory, create it and copy contents recursively
                fs.mkdirSync(fullDstPath, { recursive: true });
                const items = fs.readdirSync(src);
                for (const item of items) {
                    const srcItemPath = path.join(src, item);
                    const dstItemPath = path.join(fullDstPath, item);
                    cp(srcItemPath, dstItemPath, true);
                }
            } else {
                // source is a file, copy it
                fs.copyFileSync(src, fullDstPath);
            }
        } else {
            // destination is a file or doesn't exist, copy directly
            if (srcStat.isDirectory()) {
                console.error(`${args._args[0]}:`, `cannot overwrite directory '${dst}' with non-directory '${src}'`);
                if (recursiveCopy) process.exit(-1);
                return -1;
            }
            fs.copyFileSync(src, dst);
        }
    } catch (err) {
        console.error(`${args._args[0]}:`, err);
        if (recursiveCopy) process.exit(err.errno);
        return err.errno;
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
        const src = possibleFiles[0];
        const dest = possibleFiles[1];
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
            process.exit(-1);
        }

        // we need to duplicate possibleFiles into an variable
        // because pop() directly modifies the array when invoked
        // instead of returning the modified array
        const possibleFilesDup = [...possibleFiles];

        // now, we remove the last item from the array
        const _ = possibleFilesDup.pop();

        // filter out the destination directory from source files to avoid copying into itself
        const sourceFiles = possibleFilesDup.filter(file => {
            try {
                const fileStat = fs.statSync(file);
                const destStat = fs.statSync(dest);
                // check if the file is the same as the destination directory
                // compare both with and without trailing slash
                const normalizedFile = file.replace(/\/$/, '');
                const normalizedDest = dest.replace(/\/$/, '');
                return !(fileStat.isDirectory() && normalizedFile === normalizedDest);
            } catch (err) {
                return true; // if we can't stat the file, include it
            }
        });

        for (const srcs in sourceFiles) {
            cp(sourceFiles[srcs], dest, true);
        }                
    }
};

main();
