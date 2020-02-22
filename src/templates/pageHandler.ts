export default `const page = require("./{{PAGE}}")

module.exports = async function (context) {
  await page.render(context.bindings.req, context.res)
}`