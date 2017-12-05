const merge = require("lodash/merge");

module.exports = {
  names: ["paranoidSchizophrenia",],
  beforeDefinition: (sails, modelDef) => {
    const paranoidSchizophrenia = modelDef.options.paranoidSchizophrenia;
    if(paranoidSchizophrenia){
      const deletedAt = modelDef.strainedOptions.underscored? "deleted_at": "deletedAt";

      modelDef.attributes.deleted_at = {
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
      modelDef.strainedOptions.deletedAt = deletedAt;
      modelDef.strainedOptions.scopes.drugged = {};
    }
  },
  afterDefaultScope: (sails, modelDef) => {
    if(modelDef.options.paranoidSchizophrenia){
      modelDef.defaultScope = merge({
        where:{
          deleted_at: {
            $eq: new Date(0),
          },
        },
      }, modelDef.strainedOptions.defaultScope);

      global[modelDef.globalId].addScope("defaultScope", modelDef.defaultScope, {override: true,});
    }
  },
};
