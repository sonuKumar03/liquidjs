'use strict'

const liquid = require('./dist/liquid.node.js')

module.exports = {
  checkValidJSON: liquid.checkValidJSON,
  checkVariableAssignedBeforeUsed: liquid.checkVariableAssignedBeforeUsed,
  checkAtleastOneDynamicTableAssignPresent: liquid.checkAtleastOneDynamicTableAssignPresent
}
