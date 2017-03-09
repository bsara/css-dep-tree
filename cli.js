#!/usr/bin/env node


/* eslint no-console: "off", no-process-exit: "off" */


const chalk     = require('chalk');
const commander = require('commander');

const pkg        = require('./package.json');
const cssDepTree = require('./index');



// Chalk Constants
//---------------------------------------------------------------

const HELP_ARG     = chalk.yellow;
const HELP_DESC    = chalk.white;
const HELP_HEADING = chalk.blue.bold;
const HELP_OPTION  = chalk.green;



// Parse Args
//---------------------------------------------------------------

commander
  .version(pkg.version)
  .usage("<cssFile> [options]")

  .option("-r --relative", "")

  .option("-l --files-list", "")
  .option("-u --urls-list", "")

  .option("-L --exclude-files", "")
  .option("-U --exclude-urls",  "")
  .option("-T --exclude-tree",  "")

  .option("-c --compress", "");

commander.helpInformation = () => `
  ${HELP_HEADING("Description:")}
    ${pkg.description}.

  ${HELP_HEADING("Usage:")}
    (cssdt|cssdeptree) <${HELP_ARG("cssFile")}> [${HELP_OPTION("options")}]

  ${HELP_HEADING("Options:")}
    ${HELP_OPTION("-r")}  ${HELP_OPTION("--relative")}       ${HELP_DESC("Output files paths relative to current directory")}

    ${HELP_OPTION("-l")}  ${HELP_OPTION("--files-list")}     ${HELP_DESC("Only show list of file dependencies")}
    ${HELP_OPTION("-u")}  ${HELP_OPTION("--urls-list")}      ${HELP_DESC("Only show list of URL dependencies")}

    ${HELP_OPTION("-L")}  ${HELP_OPTION("--exclude-files")}  ${HELP_DESC("Exclude all files from output")}
    ${HELP_OPTION("-U")}  ${HELP_OPTION("--exclude-urls")}   ${HELP_DESC("Exclude all URL dependencies from output")}
    ${HELP_OPTION("-T")}  ${HELP_OPTION("--exclude-tree")}   ${HELP_DESC("Exclude dependency tree from output (only file and URL lists")}
                         ${HELP_DESC("will be present)")}

    ${HELP_OPTION("-c")}  ${HELP_OPTION("--compress")}       ${HELP_DESC("Compress output JSON")}

    ${HELP_OPTION("-h")}  ${HELP_OPTION("--help")}           ${HELP_DESC("Show this message")}
    ${HELP_OPTION("-V")}  ${HELP_OPTION("--version")}        ${HELP_DESC("Show version number")}

`;

commander.parse(process.argv);



// Run
//---------------------------------------------------------------

if (commander.args.length !== 1) {
  console.error("Invalid number of arguments given! Expecting only one CSS file path!");
  commander.help();
}


let exec    = cssDepTree;
let options = commander.relative;

if (commander.filesList) {
  exec = cssDepTree.files;
} else if (commander.urlsList) {
  exec = cssDepTree.urls;
} else {
  options = {
    relative:     commander.relative,
    excludeFiles: (!commander.filesList && commander.excludeFiles),
    excludeURLs:  (!commander.urlsList && commander.excludeURLs),
    excludeTree:  (!commander.filesList && !commander.urlsList && commander.excludeTree)
  };
}

exec(commander.args[0], options, _onFinish);




// Private Helpers
//---------------------------------------------------------------

/**
 * @param {(String|Error)} err
 * @param {*}              results
 *
 * @private
 */
function _onFinish(err, results) {
  if (err) {
    console.error(err);
    process.exit(1);
    return;
  }

  if (Array.isArray(results)) {
    results.forEach((value) => console.log(value));
    return;
  }

  console.log(commander.compress ? JSON.stringify(results) : JSON.stringify(results, undefined, 2));
}
