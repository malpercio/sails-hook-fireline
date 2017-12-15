module.exports = {
  attributes: {
    name: {
      type: Sequelize.STRING,
    },
    age: {
      type: Sequelize.INTEGER,
    },
  },
  associations: function() {
    User.hasMany(Image, {as: "images", foreignKey: "owner",});
  },
  defaultScope: function() {
    return {
      include: [{model: Image, as: "images",},],
    };
  },
  options: {
    freezeTableName: false,
    tableName: "user",
    classMethods: {},
    instanceMethods: {},
    hooks: {},
    paranoidSchizophrenia: true,
  },
};
