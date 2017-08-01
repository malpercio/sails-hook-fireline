function setAssociation(modelDef) {
  if (modelDef.associations !== null) {
    if (typeof modelDef.associations === "function") {
      modelDef.associations(modelDef);
    }
  }
}

module.exports = setAssociation;
