const cls = require("continuation-local-storage");
const merge = require("lodash/merge");
const omit = require("lodash/omit");
const Promise = require("bluebird");
const Sequelize = require("sequelize");

module.exports = function(sails) {
  global.Sequelize = Sequelize;
  Sequelize.useCLS(cls.createNamespace("sails-sequelize"));
  return {
    initialize: function(next) {
      var hook = this,
        modelList = [];
      var connection, migrate, sequelize;

      hook.initAdapters();
      hook.initModels();
      sails.log.verbose("Using connection named " + sails.config.models.connection);
      connection = sails.config.connections[sails.config.models.connection];
      connection.options = connection.options? connection.options: {};
      connection.dialect = connection.dialect? connection.dialect: "mysql";
      connection.options.dialect = connection.options.dialect? connection.options.dialect: connection.dialect;
      if (connection === null) {
        throw new Error("Connection \"" + sails.config.models.connection + "\" not found in config/connections");
      }
      if (connection.options === null) {
        connection.options = {};
      }
      connection.options.logging = sails.log.verbose;
      migrate = sails.config.models.migrate;
      sails.log.verbose("Migration: " + migrate);

      sequelize = new Sequelize(connection.database, connection.user, connection.password, connection.options);
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

          hook.setAssociation(modelDef);
          hook.setDefaultScope(modelDef);
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
    },

    initAdapters: function() {
      if(sails.adapters === undefined) {
        sails.adapters = {};
      }
    },

    initModels: function() {
      if(sails.models === undefined) {
        sails.models = {};
      }
    },

    setAssociation: function(modelDef) {
      if (modelDef.associations !== null) {
        sails.log.verbose("Loading associations for \"" + modelDef.globalId + "\"");
        if (typeof modelDef.associations === "function") {
          modelDef.associations(modelDef);
        }
      }
    },

    setDefaultScope: function(modelDef) {
      var model = global[modelDef.globalId];
      let defaultScope = modelDef.defaultScope;

      if(modelDef.__defaultScopeFunction__){
        defaultScope = merge(defaultScope, modelDef.__defaultScopeFunction__());
      }
      model.addScope("defaultScope", defaultScope,{override: true,});
    },

  };
};
