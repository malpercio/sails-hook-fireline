module.exports = {
  attributes: {
    name: {
      type: Sequelize.STRING,
    },
    role: {
      type: Sequelize.ENUM("USER", "ADMIN"),
    },
  },
  associations: function() {
    UserGroup.hasMany(User, {as: "users", foreignKey: "group",});
  },
  defaultScope: function() {
    return {
      include: [{model: User, as: "users",},],
    };
  },
  options: {
    freezeTableName: false,
    tableName: "user_group",
    classMethods: {},
    instanceMethods: {},
    hooks: {},
  },
};
