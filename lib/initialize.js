const cls = require("continuation-local-storage");
const merge = require("lodash/merge");
const omit = require("lodash/omit");
const Promise = require("bluebird");
const Sequelize = require("sequelize");
const setAssociation = require("./fx/setAssociation");
const setDefaultScope = require("./fx/setDefaultScope");

function initialize(sails){
  return (next) => {
    const connection = sails.config.connections[sails.config.models.connection],
      migrate = sails.config.models.migrate,
      modelList = [];

    global.Sequelize = Sequelize;
    Sequelize.useCLS(cls.createNamespace("sails-sequelize"));

    const sequelize = new Sequelize(connection.database, connection.user, connection.password, connection.options);

    global.sequelize = sequelize;
    return sails.modules.loadModels(function(err, models) {
      if (err !== null) {
        return next(err);
      }
      for (const modelName in models) {
        const paranoidSchizophrenia = models[modelName].options.paranoidSchizophrenia;
        const modelDef = models[modelName];

        models[modelName].options = models[modelName].options? models[modelName].options: {};

        if(!modelDef.defaultScope){
          modelDef.defaultScope = {};
        }
        if(modelDef.defaultScope &&typeof modelDef.defaultScope === "function") {
          modelDef.__defaultScopeFunction__ = modelDef.defaultScope;
          modelDef.defaultScope = {};
        }
        modelDef.extras = {};
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
        modelDef.strainedOptions = omit(modelDef.options, ["paranoidSchizophrenia", "parent", "children",]);
        modelDef.strainedOptions.scopes = modelDef.strainedOptions.scopes ? modelDef.strainedOptions.scopes: {};
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
            },
          };
          modelDef.strainedOptions.defaultScope = modelDef.strainedOptions.defaultScope? modelDef.strainedOptions.defaultScope : {};
          modelDef.strainedOptions.defaultScope = merge({
            where:{
              deleted_at: {
                $eq: new Date(0),
              },
            },
          }, modelDef.strainedOptions.defaultScope);
          modelDef.strainedOptions.paranoid = true;
          modelDef.strainedOptions.deletedAt = deletedAt;
          modelDef.strainedOptions.scopes = modelDef.strainedOptions.scopes ? modelDef.strainedOptions.scopes: {};
          modelDef.strainedOptions.scopes.drugged = {};
        }
        modelList.push(modelDef);
      }
      for(const modelDef of modelList){
        const attributes = modelDef.options.children? {}: modelDef.attributes;

        sails.log.verbose("Loading model \"" + modelDef.globalId + "\"");
        global[modelDef.globalId] = sequelize.define(modelDef.globalId, attributes, modelDef.strainedOptions);
        sails.models[modelDef.globalId.toLowerCase()] = global[modelDef.globalId];
        for(const method in modelDef.strainedOptions.classMethods){
          global[modelDef.globalId][method] = modelDef.strainedOptions.classMethods[method];
        }
        for(const method in modelDef.strainedOptions.instanceMethods){
          global[modelDef.globalId].prototype[method] = modelDef.strainedOptions.instanceMethods[method];
        }
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
      }

      for (modelName in models) {
        const modelDef = models[modelName];

        setAssociation(modelDef);
        setDefaultScope(modelDef);
      }

      if(migrate === "safe") {
        return next();
      } else {
        const forceSync = migrate === "drop";

        sequelize.sync({ force: forceSync, }).then(function() {
          return next();
        });
      }
    });
  };
}

module.exports = initialize;
