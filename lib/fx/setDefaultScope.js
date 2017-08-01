const merge = require("lodash/merge");

function setDefaultScope(modelDef) {
  const model = global[modelDef.globalId];

  if(modelDef.__defaultScopeFunction__){
    modelDef.defaultScope = merge(modelDef.defaultScope, modelDef.__defaultScopeFunction__());
  }
  model.addScope("defaultScope", modelDef.defaultScope, {override: true,});
}

module.exports = setDefaultScope;
