const merge = require("lodash/merge");
const Promise = require("bluebird");

module.exports = {
  names: ["parent", "child",],
  beforeDefinition: (sails, modelDef, models) => {
    if(modelDef.options.parent){
      modelDef.attributes = merge(modelDef.attributes, models[modelDef.options.parent.toLowerCase()].attributes);
    }
    if(modelDef.options.children){
      modelDef.associations = () => {
        for(const child of modelDef.options.children){
          const childModel = global[models[child.toLowerCase()].globalId],
            thisModel = global[modelDef.globalId];

          thisModel.belongsTo(childModel, {
            foreignKey: {
              name: child + "_id",
            },
          });
          childModel.hasOne(thisModel, {
            foreignKey: {
              name: child + "_id",
            },
          });
        }
      };
      modelDef.options.classMethods = modelDef.options.classMethods? modelDef.options.classMethods: {};
      modelDef.options.classMethods.getChild = (query) => {
        const searches= [];

        thisModel = global[modelDef.globalId];
        query.rejectOnEmpty = true;
        for(const child of modelDef.options.children){
          const childModel = global[models[child.toLowerCase()].globalId];

          searches.push(childModel.findOne(query));
        }
        return Promise.any(searches)
          .then((parentJoin) => {
            if(!parentJoin){
              return parentJoin;
            }
            const modelName = parentJoin.constructor.name;

            return {
              model: modelName,
              value: parentJoin,
            };
          });
      };
    }
  },
  beforeLoad:(sails, modelDef, models) => {
    if(modelDef.options.children){
      modelDef.attributes = {};
    }
  },
  afterDefinition: (sails, modelDef) => {
    if(modelDef.options.parent){
      global[modelDef.globalId].afterCreate("afterChildCreation", (child) => {
        const query = {
        };

        query[modelDef.globalId + "_id"] = child.id;
        return global[modelDef.options.parent].create(query);
      });
      global[modelDef.globalId].afterDestroy("afterChildDestruction", (child) => {
        const query = {
          where: {},
        };

        query[modelDef.globalId + "_id"] = child.id;
        return global[modelDef.options.parent].destroy(query);
      });
    }
  },
};
