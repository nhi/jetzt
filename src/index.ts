#!/usr/bin/env node

import chalk from "chalk"
import figlet from "figlet"
import commander = require("commander");
import { run } from "./run"
import { LogLevel, setLogLevel } from "./lib/log"
import { enableDryRun } from "./lib/exec"
import { Mode, ModeFlags } from "./mode"
const version = require("../package.json").version

console.log(
  chalk.green(figlet.textSync("jetzt", { horizontalLayout: "full" }))
)

let nextJsFolder: string | undefined

const program = new commander.Command()
program
  .version(version)
  .arguments("<nextjsfolder>")
  .action(folder => {
    nextJsFolder = folder
  })
  .option("-v, --verbose", "Output more information")
  .option("--debug", "Output debug information")
  .option(
    "-d, --dryrun",
    "Don't actually deploy to Azure, just output cli commands that would run"
  )
  .option(
    "-b, --no-deploy",
    "Just build the Azure Function packages, do not attempt to deploy"
  )
  .parse(process.argv)

// Output help by default
if (!process.argv.slice(2).length || !nextJsFolder) {
  program.outputHelp()
  process.exitCode = 1
} else {
  // Logic
  (async function() {
    if (program.verbose) {
      setLogLevel(LogLevel.Verbose)
    }
    if (program.debug) {
      setLogLevel(LogLevel.Debug)
    }

    if (program.dryrun) {
      enableDryRun()
    }

    let mode: Mode = {
      mode: ModeFlags.Build
    }
    if (program.deploy) {
      mode.mode |= ModeFlags.Deploy
    }

    await run(nextJsFolder, mode)
  })().catch(e => {
    if (e.message) {
      // Empty message means we've probably handled it already, don't output anything
      console.log(chalk.red(`Error: ${e.message}`))
    }
    process.exitCode = 1
  })
}
