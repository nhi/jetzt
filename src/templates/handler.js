const page = require("./{{PAGE}}")

module.exports = async function ({req, res}) {
  if (page.render instanceof Function) {
    // Is a React component
    await page.render(req, res)
  } else {
    // Is an API
    await page.default(req, res)
  }
}