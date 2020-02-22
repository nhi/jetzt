import { build } from "./build"
import { getJetztConfig } from "./config"
import { deploy } from "./deploy"
import { runStep } from "./lib/step"
import { Mode, ModeFlags } from "./mode"

export async function run(path: string, mode: Mode, zip: boolean = true) {
  // Get configurations
  const config = await runStep("Looking for configuration...", () =>
    getJetztConfig(path)
  )

  // Build
  if (mode.mode & ModeFlags.Build) {
    await build(config, zip)
  }

  // Deploy
  if (mode.mode & ModeFlags.Deploy) {
    await deploy(config)
  }
}
