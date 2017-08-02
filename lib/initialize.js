const cls = require("continuation-local-storage");
const loadHooks = require("./fx/loadHooks");
const omit = require("lodash/omit");
const Sequelize = require("sequelize");
const setAssociation = require("./fx/setAssociation");
const setDefaultScope = require("./fx/setDefaultScope");
const setDefaultsOnModel = require("./fx/setDefaultsOnModel");

function initialize(sails){
  const hooks = loadHooks(sails);

  return (next) => {
    const connection = sails.config.connections[sails.config.models.connection],
      migrate = sails.config.models.migrate,
      modelList = [];
    let sequelize;
    global.Sequelize = Sequelize;
    Sequelize.useCLS(cls.createNamespace("sails-sequelize"));
    if(connection.uri){
      sequelize = new Sequelize(connection.uri, connection.options);
    }else{
      sequelize = new Sequelize(connection.database, connection.user, connection.password, connection.options);
    }

    global.sequelize = sequelize;
    return sails.modules.loadModels(function(err, models) {

      if (err !== null) {
        return next(err);
      }

      for (const modelName in models) {
        const modelDef = models[modelName];

        setDefaultsOnModel(modelDef);
        hooks.beforeDefinition(modelDef, models);

        modelDef.strainedOptions = omit(modelDef.options, hooks.omitable());
        modelList.push(modelDef);
      }

      for(const modelDef of modelList){
        connection.options.logging.verbose("Loading model \"" + modelDef.globalId + "\"");
        global[modelDef.globalId] = sequelize.define(modelDef.globalId, modelDef.attributes, modelDef.strainedOptions);
        sails.models[modelDef.globalId.toLowerCase()] = global[modelDef.globalId];
        hooks.afterDefinition(modelDef, models);
      }

      for (modelName in models) {
        const modelDef = models[modelName];

        hooks.beforeAssociation(modelDef, models);
        setAssociation(modelDef);
        hooks.afterAssociation(modelDef, models);

        hooks.beforeDefaultScope(modelDef, models);
        setDefaultScope(modelDef);
        hooks.afterDefaultScope(modelDef, models);
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
