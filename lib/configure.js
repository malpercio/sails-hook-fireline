function configure(){
  return () => {
    sails.adapters = sails.adapters? sails.adapters: {};
    sails.models = sails.models? sails.models: {};
    sails.log.verbose("Using connection named " + sails.config.models.connection);
    const connection = sails.config.connections[sails.config.models.connection];

    connection.options = connection.options? connection.options: {};
    connection.dialect = connection.dialect? connection.dialect: "mysql";
    connection.options.dialect = connection.options.dialect? connection.options.dialect: connection.dialect;
    if (connection === null) {
      throw new Error("Connection \"" + sails.config.models.connection + "\" not found in config/connections");
    }
    connection.options = connection.options? connection.options: {};
    sails.config.models.migrate = sails.config.models.migrate? sails.config.models.migrate: "safe";
    connection.options.logging = sails.log.verbose;
    sails.log.verbose("Migration: " + sails.config.models.migrate);
  };
}

module.exports = configure;
