import { resolve } from "url"
import { NextPage } from "../next"

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

interface Proxy {
  proxies: {
    page_assets: ProxyEntry
    static_assets: ProxyEntry
    [key: string]: ProxyEntry
  }
}


export function handler(pageName: string) {
  return `const page = require("./${pageName}");

module.exports = async function (context) {
    await page.render(context.bindings.req, context.res);
};`
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
  for (const p of pages.filter(p => p.isStatic && !p.isSpecial)) {
    (proxiesTemplate as Proxy).proxies[`proxy_${p.identifier}`] = {
      matchCondition: {
        methods: ["GET"],
        route: p.route
      },
      backendUri: resolve(assetsUrl, `_next/pages/${p.targetPageFileName}`)
    }
  }

  // Add proxies for static assets
  return JSON.stringify(proxiesTemplate)
}
