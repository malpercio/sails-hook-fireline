const merge = require("lodash/merge");

function setDefaultScope(modelDef) {
  const model = global[modelDef.globalId];
  let defaultScope = modelDef.defaultScope;

  if(modelDef.__defaultScopeFunction__){
    defaultScope = merge(defaultScope, modelDef.__defaultScopeFunction__());
  }
  model.addScope("defaultScope", defaultScope,{override: true,});
}

module.exports = setDefaultScope;
