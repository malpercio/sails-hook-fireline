const setDefaultScopeFx = require("./fx/setDefaultScope");

function setDefaultScope() {
  return (modelDef) => {
    sails.log.verbose("Setting default scope for \"" + modelDef.globalId + "\"");
    setDefaultScopeFx(modelDef);
  };
}

module.exports = setDefaultScope;
