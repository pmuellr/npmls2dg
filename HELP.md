%%program%%d %%version%% - convert npm ls output to a dependency graph

usage:

    %%program%% <[npm-ls output]> <[output]>>

Expects the output of `npm ls --json` as the intput file, and generates the
specified output file.  Use `-` for either file to use stdio instead.

options:
    -s --svg        generate SVG output
    -d --dot        generate Graphviz DOT output
    -h --help       print this help
    -v --version    print the program version
