const fs = require('fs')
const path = require('path')
const schema = [fs.readFileSync(path.join(__dirname, "type.graphql"), "utf8")];
module.exports = schema