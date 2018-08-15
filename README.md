[![forthebadge](http://forthebadge.com/images/badges/built-by-codebabes.svg)](https://coconutt.io/)

[![npm version](https://badge.fury.io/js/sails-hook-fireline.svg)](http://badge.fury.io/js/sails-hook-fireline)
[![Stories in progress](https://img.shields.io/waffle/label/malpercio/sails-hook-fireline/in%20progress.svg)](https://waffle.io/malpercio/sails-hook-fireline)
[![Build Status](https://travis-ci.org/malpercio/sails-hook-fireline.svg?branch=master)](https://travis-ci.org/malpercio/sails-hook-fireline)
[![Dependencies](https://david-dm.org/malpercio/sails-hook-fireline.svg)](https://david-dm.org/malpercio/sails-hook-fireline)
[![DevDependencies](https://david-dm.org/malpercio/sails-hook-fireline/dev-status.svg)](https://david-dm.org/malpercio/sails-hook-fireline?type=dev)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/malpercio/sails-hook-fireline/master/LICENSE)


# sails-hook-fireline
Sails.js hook to use sequelize ORM.
It's like Waterline but so much hotter. (Also, exclusive to SQL DB's)


# Install

Install this hook with:

```bash
$ npm install sails-hook-fireline bluebird sequelize --save
```

As you can see, you have to install [`bluebird`](http://bluebirdjs.com/docs/getting-started.html) and [`sequelize`](http://docs.sequelizejs.com/) independently and add them as dependencies. This allows you to better control you ORM versions, as this hook is  somewhat *version agnostic*.

Bluebird is needed for transactions to work correctly. Please, refer to the official
Sequelize docs linked above for more info about patching Bluebird (done inside this hook).

This hook supports versions 4 and 5.0-beta currently.

# Configuration

Modify `.sailsrc` to resemble the next file:
```json
{
  "hooks": {
    "orm": false,
    "pubsub": false
  }
}
```

## Connections
To make a connection, configure sails like so
```javascript
//sails.config.connections or sails.config.datastores
module.exports.connections = {
  somePostgresqlServer: {
    //You can pass an URI connection string. Be aware that this takes precedence
    //uri: 'postgresql://user:password@host:port/database',
    user: 'postgres',
    password: '',
    database: 'sequelize',
    //Thisi s a typical Sequelize constructor `options` object
    options: {
      dialect: 'postgres',
      host   : 'localhost',
      port   : 5432,
      logging: console.log //Why not? Just ship it like this to production. No biggie.
    }
  }
}
module.exports.models = {
  //You can also use sails.config.models.datastore
  connection: "somePostgresqlServer",
  migrate: "drop", // 'alter' and 'safe' are also options
}
```

## Models
An example of model configuration on `models/user.js`
```javascript
module.exports = {
  attributes: {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    age: {
      type: Sequelize.INTEGER
    }
  },
  associations: function() {
    user.hasMany(image, {
      foreignKey: {
        name: 'owner',
        allowNull: false
      }
    });
  },
  options: {
    tableName: 'user',
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  }
};
```

## Available variables

* `Sequelize` or `sails.Sequelize` as the constructor
* `sequelize` or `sails.Sequelize` as the instance
* `Op` as a shortcut to `Sequelize.Op`

## Sequelize Extensions
To avoid a potential loss of an unique index when using `deletedAt` (for unicity and softDelete),
an option can be passed to the model, making its default zero, avoiding such SQL halting experience.

```javascript
module.exports = {
  attributes: {},
  associations: () => {},
  options: {
    classMethods: {},
    instanceMethods: {},
    hooks: {},
    paranoidSchizophrenia: true,
  }
};
```
It work just the same, except for some minor changes:
* Default value for `deletedAt` is Date(0)
* When `deletedAt` is accessed, if date is Date(0), it will return `null` (custom getter)
* Queries including the aforementioned model, will default to inner-joins **BEWARE**
* When making queries in `paranoid: false`, a non-default scope must be used.
  This package provides the `drugged` scope that has no effect over queries whatsoever for this specific purpose.
  ```js
  //All three are equivalent
  let query = {
    where: {},
    paranoid: false,
  };
  User.scope(null).findAll(query);
  User.scope('drugged').findAll(query);
  User.unscoped().findAll(query);

  ```
## Fireline Hooks
When fireline is preparing your modelrs, you can run your own functions to alter the default behaviour.

```javascript
somePostgresqlServer: {
  user: 'postgres',
  password: '',
  database: 'sequelize',
  options: {
    dialect: 'postgres',
    host   : 'localhost',
    port   : 5432,
    logging: console.log
  },
  hooks: {
    myFirstHook: {
      beforeDefinition: (modelDef, modelList) => {},
      afterDefinition: (modelDef, modelList)  => {},
      beforeLoad: (modelDef, modelList) => {},
      afterLoad: (modelList)  => {},
      beforeAssociation: (model, modelList) => {},
      afterAssociation: (model, modelList) => {},
      beforeDefaultScope: (model, modelList) => {},
      afterDefaultScope: (model, modelList) => {},
    }
  }
}
```

The hooks to be run are:

* beforeDefinition
* afterDefinition

(Refering to model loading from files, just an object is loaded)

* beforeLoad
* afterLoad

(Sequelize `define`)


* beforeAssociation
* afterAssociation

(Associations are created with the `association()` methods of each model)


* beforeDefaultScope
* afterDefaultScope

(Default scope is added)

## Special Thanks
A big shoutout to [Gergely Munkacsy](https://github.com/festo) for starting the base of this fork at [`sails-hook-sequelize`](https://github.com/KSDaemon/sails-hook-sequelize).

Also, special a special mention goes to [Susana Hahn](https://github.com/susuhahnml) for using this hook to make [`awsome-factory-associator`](https://github.com/susuhahnml/awsome-factory-associator), a module that provides a syntax for easily creating factories when unit testing.

## License
[MIT](./LICENSE)
