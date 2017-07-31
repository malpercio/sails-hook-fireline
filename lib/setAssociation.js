const setAssociationFx = require("./fx/setAssociation");

function setAssociation(sails) {
  return (modelDef) => {
    sails.log.verbose("Loading associations for \"" + modelDef.globalId + "\"");
    setAssociationFx(modelDef);
  };
}

module.exports = setAssociation;
