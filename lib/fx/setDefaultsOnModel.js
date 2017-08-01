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
}

module.exports = setDefaultsOnModel;
