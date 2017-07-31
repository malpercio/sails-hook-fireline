const initialize = require("./lib/initialize");
const configure = require("./lib/configure");
const setAssociation = require("./lib/setAssociation");
const setDefaultScope = require("./lib/setDefaultScope");

module.exports = (sails) => {
  return {
    configure: configure(sails),
    initialize: initialize(sails),
    setAssociation: setAssociation(sails),
    setDefaultScope: setDefaultScope(sails),
  };
};
