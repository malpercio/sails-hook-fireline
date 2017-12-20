module.exports = {
  "environment": "test",
  "hooks": {
    "grunt": false,
    "orm": false,
    "pubsub": false,
    "blueprints": false,
    "sequelize": require("../index")
  },
  "log":{
    "level": "silent"
  },
  "routes": {
   "/": {
     "view": "homepage"
   },
   "POST /user/create": "UserController.create",
   "POST /image/create": "ImageController.create"
 },
 "models" : {
  "connection": "fireline",
  "migrate": "drop"
 },
 "connections" : {
    "fireline": {
      "user": "root",
      "password": "",
      "database": "fireline_test",
      "dialect": "mysql",
      "options": {
         "operatorsAliases": false,
      },
      "hooks": {
        "logging": {
          beforeLoad:() => {console.log("Before loading")}
        }
      },
    }
 }
}
