import { resolve } from "url"
import { NextPage } from "../next"
import fse from "fs-extra"
import functionTemplate from "./function.json"
import hostTemplate from "./host.json"
import proxiesTemplate from "./proxies.json"

interface ProxyEntry {
  matchCondition: {
    methods: string[]
    route: string
  }
  backendUri: string
}

interface ProxiesConfig {
  proxies: {
    page_assets: ProxyEntry
    static_assets: ProxyEntry
    [key: string]: ProxyEntry
  }
}

export async function nextToAzureFunction(page: string) {
  const file = await fse.readFile("./handler.js",{ encoding: "utf-8" })
  return file.replace("{{PAGE}}", page)
}

export function functionJson(page: NextPage) {
  functionTemplate.bindings[0].route = page.processedRoute
  return JSON.stringify(functionTemplate)
}

export function hostJson(): string {
  return JSON.stringify(hostTemplate)
}

export function proxiesJson(assetsUrl: string, pages: NextPage[]): string {

  // Generate proxies for static pages
  const staticPages = pages.filter(page => page.isStatic && !page.isSpecial)
  for (const page of staticPages) {
    (proxiesTemplate as ProxiesConfig).proxies[`proxy_${page.identifier}`] = {
      matchCondition: {
        methods: ["GET"],
        route: page.route
      },
      backendUri: resolve(assetsUrl, `_next/pages/${page.targetPageFileName}`)
    }
  }

  // Add proxies for static assets
  proxiesTemplate.proxies.page_assets.backendUri = `${assetsUrl}_next/{asset}`
  proxiesTemplate.proxies.static_assets.backendUri = `${assetsUrl}static/{asset}`

  return JSON.stringify(proxiesTemplate)
}
