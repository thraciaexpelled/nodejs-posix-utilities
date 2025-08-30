#!/usr/bin/env node

const VERSION = "0.0.0";
const SCRIPT_VERSION = "0.9.0";

const args = require("command-line-parser")({
    args: process.argv.slice(1),   // skip node
    allowEmbeddedValues: true,
    allowKeyGrouping: true
});

let basename = (name, suffix) => {
    let splitName = name.split("/")
        .filter(splitName => splitName);
    let hasSuffix = function() {
        return suffix === undefined;
    };
    let _basename = splitName[splitName.length - 1];
    if (hasSuffix()) {
        return _basename;
    } else {
        return basename(_basename).slice(0, -suffix.length);
    }
};

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
    let a = returnPrettyString(x, Color.White, true);
    let b = returnPrettyString(y, Color.Default, false);
    console.log(`\t${a}\n\t${b}\n`);
};

const main = () => {
    let scriptName = basename(process.argv.slice(1)[0], (undefined));
    if (process.argv.slice(1).length <= 1) {
        console.error(`${scriptName}:`, "missing name and/or suffix");
        console.error(`Run '${scriptName} --help for more information.`);
        process.exit(-1);
    }

    // help the user and do nothing else
    if (args.help) {
        let usageInBold = returnPrettyString("Usage", Color.Default, true);
        console.log(`${usageInBold}:`, `${scriptName} <options> [NAME] <suffix>`);
        console.log("Returns NAME without leading directories");
        console.log("Also removes suffixes of NAME if given any.");
        gap(1);
        console.log("Possible options:");
        description('-z', "Prints '\\0' instead of a new-line at end of output");
        description('--help', "Prints this message");
        description('--version', "Prints version of this script + the package itself");
        gap(1);
        console.log(`nodejs-posix-utilities ${VERSION}; ${scriptName} ${SCRIPT_VERSION}`);
        process.exit(0);
    }

    if (args.version) {
        console.log(`nodejs-posix-utilities ${VERSION}; ${scriptName} ${SCRIPT_VERSION}`);
        process.exit(0);
    }
    
    let name = args._args[1];
    console.log(name);
    let suffix = function() {
        if (!args._args[2]) return (undefined);
        return args._args[2];
    };
    
    // TODO: refactor this
    if (!suffix) {
        if (args.z) {
            process.stdout.write(`${basename(name)}\0`);
            process.exit(0);
        }
        console.log(basename(name));
        process.exit(0);
    } else {
        if (args.z) {
            process.stdout.write(`${basename(name, suffix())}\0`);
            process.exit(0);
        }
        console.log(basename(name, suffix()));
        process.exit(0);
    }
};

main();
