function configure(){
  return () => {
    const connection = sails.config.connections[sails.config.models.connection];

    sails.adapters = sails.adapters? sails.adapters: {};
    sails.models = sails.models? sails.models: {};
    sails.config.models.migrate = sails.config.models.migrate? sails.config.models.migrate: "safe";

    connection.dialect = connection.dialect? connection.dialect: "mysql";
    connection.options = connection.options? connection.options: {};
    connection.options.logging = connection.options.logging? connection.options.logging : sails.log.verbose;
    connection.options.dialect = connection.options.dialect? connection.options.dialect: connection.dialect;
    connection.hooks = connection.hooks? connection.hooks: {};

    connection.options.logging("Using connection named " + sails.config.models.connection);
    if (connection === null) {
      throw new Error("Connection \"" + sails.config.models.connection + "\" not found in config/connections");
    }
    connection.options.logging("Migration: " + sails.config.models.migrate);
  };
}

module.exports = configure;
