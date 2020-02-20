export default `
const page = require("./pageName")

module.exports = async function (context) {
  await page.render(context.bindings.req, context.res)
}`