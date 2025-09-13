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
