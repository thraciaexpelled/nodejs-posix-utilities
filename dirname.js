#!/usr/bin/env node

const VERSION = "0.0.0";
const SCRIPT_VERSION = "1.0.0";

const args = require("command-line-parser")({
    args: process.argv.slice(1),   // skip node
    allowEmbeddedValues: true,
    allowKeyGrouping: true
});

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

// ---- actual dirname function ----
// NOTE:    this is VERY hardcoded so other utilities
//          could be implemented quickly
let dirname = (str) => {
    if (!str.includes('/')) return '.'; // cwd  
    let paths = str.split('/').filter(paths => paths);
    if (paths.length > 1) {
        return `/${paths[0]}`;
    } else if (paths.length == 1) return '/';
};

const main = () => {
    // tiny basename(3) implementation
    // because node has absolute filepaths
    // for scripts
    const bs = function(s) {
        let x = s.split('/').filter(s => s);
        return x[x.length - 1];
    };

    const scriptName = bs(process.argv.slice(1)[0]);
    if (process.argv.slice(1).length < 2) {
        console.error(`${scriptName}:`, "missing name");
        console.error(`Run ${scriptName} --help for more information.`);
        process.exit(-1);
    }


    if (args.help) {
        let usageInBold = returnPrettyString("Usage", Color.Default, true);
        console.log(`${usageInBold}:`, `${scriptName} <options> [NAME]`);
        console.log("Returns the first directory of the current working directory.");
        console.log("Returns '.' if no '/' in NAME, indicating current working directory.");
        gap(1);
        console.log("Possible options:");
        description(['-z', '--zero'], "Output has NULL instead of newline");
        description([(undefined), '--help'], "Prints this message and exit");
        description([(undefined), '--version'], "Prints version and exits");
        console.log("Examples:");
        console.log("   /dev/sda --> /dev");
        console.log("   /dev     --> /");
        console.log("   ~/dev/n  --> .");
        gap(1);
        console.log(`nodejs-posix-utilities ${VERSION}; ${scriptName} ${SCRIPT_VERSION}`);
        process.exit(0);
    }

    if (args.version) {
        console.log(`nodejs-posix-utilities ${VERSION}; ${scriptName} ${SCRIPT_VERSION}`);
        process.exit(0);
    }

    const name = dirname(args._args[1]);
    if (args.z) {
        process.stdout.write(`${name}\0`);
        process.exit(0);
    }

    console.log(name);
};

main();
