const initialize = require("./lib/initialize");
const configure = require("./lib/configure");

module.exports = (sails) => {
  return {
    configure: configure(sails),
    initialize: initialize(sails),
  };
};
