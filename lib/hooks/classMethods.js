module.exports = {
  names: ["parent", "child",],
  afterDefinition: (sails, modelDef) => {
    for(const method in modelDef.strainedOptions.classMethods){
      global[modelDef.globalId][method] = modelDef.strainedOptions.classMethods[method];
    }
  },
};
