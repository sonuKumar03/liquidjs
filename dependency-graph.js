'use strict'

const liquid = require('./dist/liquid.node.js')

module.exports = {
  createEngine: liquid.createEngine,
  getTemplates: liquid.getTemplates,
  parseAssign: liquid.parseAssign,
  createDependencyTree: liquid.createDependencyTree,
  getAffectedVariables: liquid.getAffectedVariables,
  checkForCyclicDependency: liquid.checkForCyclicDependency,
  getAssignedVariables: liquid.getAssignedVariables
}
