const merge = require("lodash/merge");

module.exports = {
  names: ["paranoidSchizophrenia",],
  beforeDefinition: (sails, modelDef) => {
    const paranoidSchizophrenia = modelDef.options.paranoidSchizophrenia;
    if(paranoidSchizophrenia){
      const deletedAt = modelDef.strainedOptions.underscored? "deleted_at": "deletedAt";

      modelDef.attributes[deletedAt] = {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date(0),
        get(){
          const date = new Date(this.getDataValue(deletedAt));

          if(date.getTime() === 0){
            return null;
          }
          return date;
        },
      };
      modelDef.strainedOptions.paranoid = true;
      modelDef.strainedOptions.timestamps = true;
      modelDef.strainedOptions.deletedAt = deletedAt;
      modelDef.strainedOptions.scopes.drugged = {};
    }
  },
  beforeDefaultScope: (sails, modelDef) => {
    const deletedAt = modelDef.strainedOptions.underscored? "deleted_at": "deletedAt";

    if(modelDef.options.paranoidSchizophrenia){
      const scope = {
        where: {},
      };

      scope.where[deletedAt] = {
        $eq: new Date(0),
      };
      modelDef.defaultScope = merge(scope, modelDef.strainedOptions.defaultScope);
      global[modelDef.globalId].addScope("defaultScope", modelDef.defaultScope, {override: true,});
    }
  },
};
