#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <string.h>

void panic(const char *msg) {
    fprintf(stderr, "err - %s\n", msg);
}

const char *boilerplate =
"const VERSION = \"0.0.0\";\n"
"const SCRIPT_VERSION = \"0.1.0\";\n"
"\n"
"const args = require(\"command-line-parser\")({\n"
"    args: process.argv.slice(1),   // skip node\n"
"    allowEmbeddedValues: true,\n"
"    allowKeyGrouping: true\n"
"});\n"
"\n"
"const fs = require('fs');\n"
"\n"
"// derived from basename.js\n"
"// only has what we need\n"
"const Color = {\n"
"    Default: 39,\n"
"    White: 37,\n"
"};\n"
"\n"
"const gap = (n) => {\n"
"    for (var _ = 0; _ < n; _++)\n"
"        console.log();\n"
"};\n"
"\n"
"const returnPrettyString = (txt, color, bold) => {\n"
"    if (bold) return `\\x1b[1;${color}m${txt}\\x1b[0m`;\n"
"    return `\\x1b[0;${color}m${txt}\\x1b[0m`;\n"
"};\n"
"\n"
"const description = (x, y) => {\n"
"    let a = function() {\n"
"        if (Array.isArray(x)) {\n"
"            if (x[0] === undefined) x = x[x.length - 1];\n"
"            const doubleArgs = x.toString().replace(',', ', ');\n"
"            return returnPrettyString(doubleArgs, Color.White, true);\n"
"        } else {\n"
"            return returnPrettyString(x, Color.White, true);\n"
"        }\n"
"    };\n"
"    let b = returnPrettyString(y, Color.Default, false);\n"
"    console.log(`\\t${a()}\\n\\t${b}\\n`);\n"
"};\n";


int main(int argc, char **argv) {
    if (argc < 2) {
        panic("missing utility name");
        return 1;
    }

    // process all arguments after the program name
    for (int i = 1; i < argc; ++i) {
        FILE *fptr = fopen(argv[i], "w");
        if (fptr == NULL) {
            panic("failed to create file");
            return 1;
        }
        fwrite(boilerplate, 1, strlen(boilerplate), fptr);
        fclose(fptr);
    }

    return 0;
}