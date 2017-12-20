const cls = require("continuation-local-storage");
const loadHooks = require("./fx/loadHooks");
const Sequelize = require("sequelize");
const setAssociation = require("./fx/setAssociation");
const setDefaultScope = require("./fx/setDefaultScope");
const setDefaultsOnModel = require("./fx/setDefaultsOnModel");
const omit = require("lodash/omit");


function initialize(sails){
  const hooks = loadHooks(sails);

  return (next) => {
    const connection = sails.config.connections[sails.config.models.connection],
      migrate = sails.config.models.migrate,
      modelList = [];
    let sequelize;

    global.Sequelize = Sequelize;
    sails.Sequelize = Sequelize;
    Sequelize.useCLS(cls.createNamespace("sails-sequelize"));

    if(connection.uri){
      sequelize = new Sequelize(connection.uri, connection.options);
    }else{
      sequelize = new Sequelize(connection.database, connection.user, connection.password, connection.options);
    }

    global.sequelize = sequelize;
    sails.sequelize = sequelize;

    global.Op = Sequelize.Op;
    return sails.modules.loadModels(function(err, models) {

      if (err !== null) {
        return next(err);
      }

      for (const modelName in models) {
        const modelDef = models[modelName];

        setDefaultsOnModel(modelDef);
        hooks.beforeDefinition(modelDef, models);
        modelDef.hooks.beforeDefinition(modelDef, models);

        modelDef.strainedOptions = omit(modelDef.strainedOptions, hooks.omitable());
        modelList.push(modelDef);
      }
      for(const modelDef of modelList){
        hooks.beforeLoad(modelDef, models);
        modelDef.hooks.beforeLoad(modelDef, models);
        connection.options.logging("Loading model \"" + modelDef.globalId + "\"");
        global[modelDef.globalId] = sequelize.define(modelDef.globalId, modelDef.attributes, modelDef.strainedOptions);
        sails.models[modelDef.globalId.toLowerCase()] = global[modelDef.globalId];
        hooks.afterDefinition(modelDef, models);
        modelDef.hooks.afterDefinition(modelDef, models);
      }

      hooks.afterLoad(sails.models);

      for (modelName in models) {
        const modelDef = models[modelName];

        hooks.beforeAssociation(modelDef, models);
        modelDef.hooks.beforeAssociation(modelDef, models);
        setAssociation(modelDef);
        hooks.afterAssociation(modelDef, models);
        modelDef.hooks.afterAssociation(modelDef, models);

        hooks.beforeDefaultScope(modelDef, models);
        modelDef.hooks.beforeDefaultScope(modelDef, models);
        setDefaultScope(modelDef);
        hooks.afterDefaultScope(modelDef, models);
        modelDef.hooks.afterDefaultScope(modelDef, models);
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
