const require_tree = require("require-tree");
const merge = require("lodash/merge");

module.exports = (sails) => {
  const hooks = require_tree("../hooks/");

  return {
    beforeDefinition: (modelDef, modelList) => {
      for(const hookName in hooks){
        if(hooks[hookName].beforeDefinition){
          hooks[hookName].beforeDefinition(sails, modelDef, modelList);
        }
      }
    },
    afterDefinition: (modelDef, modelList) => {
      for(const hookName in hooks){
        if(hooks[hookName].afterDefinition){
          hooks[hookName].afterDefinition(sails, modelDef, modelList);
        }
      }
    },
    afterAssociation: (model, modelList) => {
      for(const hookName in hooks){
        if(hooks[hookName].afterAssociation){
          hooks[hookName].afterAssociation(sails, model, modelList);
        }
      }
    },
    beforeAssociation: (model, modelList) => {
      for(const hookName in hooks){
        if(hooks[hookName].beforeAssociation){
          hooks[hookName].beforeAssociation(sails, model, modelList);
        }
      }
    },
    afterDefaultScope: (model, modelList) => {
      for(const hookName in hooks){
        if(hooks[hookName].afterDefaultScope){
          hooks[hookName].afterDefaultScope(sails, model, modelList);
        }
      }
    },
    beforeDefaultScope: (model, modelList) => {
      for(const hookName in hooks){
        if(hooks[hookName].beforeDefaultScope){
          hooks[hookName].beforeDefaultScope(sails, model, modelList);
        }
      }
    },
    omitable: () => {
      const omitable = [];

      for(const hookName in hooks){
        name = merge(omitable, hooks[hookName].names);
      }
      return omitable;
    },
  };
};
