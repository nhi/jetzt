import { resolve } from "url"
import { NextPage } from "../next"
import functionTemplate from "./function.json"
import hostTemplate from "./host.json"
import proxiesTemplate from "./proxies.json"
import apiHandler from "./apiHandler"
import pageHandler from "./pageHandler"
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

export function nextToAzureFunction(page: NextPage) {
  switch (page.type) {
  case "api":
    return apiHandler.replace("{{PAGE}}", page.targetPageFileName)
  case "ssr":
  case "special":
  case "static":
  default:
    return pageHandler.replace("{{PAGE}}", page.targetPageFileName)
  }
}

export function functionJson(page: NextPage) {
  const template = functionTemplate
  template.bindings[0].route = page.processedRoute
  template.bindings[1].name = "res"

  switch (page.type) {
  case "api":
    template.bindings[0].methods = ["get", "post"]
    break
  case "ssr":
  case "special":
  case "static":
  default:
    template.bindings[0].methods = ["get"]
    break
  }

  return JSON.stringify(functionTemplate, null, 2)
}

export function hostJson(): string {
  return JSON.stringify(hostTemplate, null, 2)
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

  return JSON.stringify(proxiesTemplate, null, 2)
}
