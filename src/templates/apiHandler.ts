export default `const page = require("./{{PAGE}}")

module.exports = async function (context) {
  await page.default(context.req, context.res)
}`