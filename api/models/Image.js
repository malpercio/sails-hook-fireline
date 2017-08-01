module.exports = {
  attributes: {
    url: {
      type: Sequelize.STRING,
    },
  },
  associations: function() {
    Image.belongsTo(User, {foreignKey: "owner",});
  },
  options: {
    freezeTableName: false,
    tableName: "image",
    classMethods: {},
    instanceMethods: {},
    hooks: {},
  },
};
