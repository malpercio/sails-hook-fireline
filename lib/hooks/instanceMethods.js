module.exports = {
  names: ["parent", "child",],
  afterDefinition: (sails, modelDef) => {
    for(const method in modelDef.strainedOptions.instanceMethods){
      global[modelDef.globalId].prototype[method] = modelDef.strainedOptions.instanceMethods[method];
    }
  },
};
