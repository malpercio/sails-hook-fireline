function identity(){
  return null;
}

function setDefaultsOnModel(modelDef) {
  modelDef.options = modelDef.options? modelDef.options: {};

  modelDef.defaultScope = modelDef.defaultScope? modelDef.defaultScope: {};

  if(modelDef.defaultScope && typeof modelDef.defaultScope === "function") {
    modelDef.__defaultScopeFunction__ = modelDef.defaultScope;
    modelDef.defaultScope = {};
  }
  modelDef.extras = {};
  modelDef.strainedOptions = {};
  modelDef.strainedOptions.scopes = {};
  modelDef.hooks = modelDef.hooks ? modelDef.hooks : {};
  modelDef.hooks = modelDef.hooks ? modelDef.hooks : identity;
  modelDef.hooks.beforeLoad = modelDef.hooks.beforeLoad ? modelDef.hooks.beforeLoad : identity;
  modelDef.hooks.afterLoad = modelDef.hooks.afterLoad ? modelDef.hooks.afterLoad : identity;
  modelDef.hooks.beforeDefinition = modelDef.hooks.beforeDefinition ? modelDef.hooks.beforeDefinition : identity;
  modelDef.hooks.beforeAssociation = modelDef.hooks.beforeAssociation ? modelDef.hooks.beforeAssociation : identity;
  modelDef.hooks.beforeDefaultScope = modelDef.hooks.beforeDefaultScope ? modelDef.hooks.beforeDefaultScope : identity;
  modelDef.hooks.afterDefinition = modelDef.hooks.afterDefinition ? modelDef.hooks.afterDefinition : identity;
  modelDef.hooks.afterAssociation = modelDef.hooks.afterAssociation ? modelDef.hooks.afterAssociation : identity;
  modelDef.hooks.afterDefaultScope = modelDef.hooks.afterDefaultScope ? modelDef.hooks.afterDefaultScope : identity;
}

module.exports = setDefaultsOnModel;
