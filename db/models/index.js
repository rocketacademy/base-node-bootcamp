/* eslint-disable comma-dangle */
import { Sequelize } from 'sequelize';
import allConfig from '../../sequelize.config.cjs';

import initMessageModel from './message.mjs';
import initTaskModel from './task.mjs';
import initUserModel from './user.mjs';
import initProjectModel from './project.mjs';

const env = process.env.NODE_ENV || 'development';
const config = allConfig[env];
const db = {};

// initiate a new instance of Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// here we are putting initModel from model.mjs into the object "db" (line 14)
db.Message = initMessageModel(sequelize, Sequelize.DataTypes);
db.Task = initTaskModel(sequelize, Sequelize.DataTypes);
db.User = initUserModel(sequelize, Sequelize.DataTypes);
db.Project = initProjectModel(sequelize, Sequelize.DataTypes);

/** MAIN TABLES */
/** One to one relationship between A and B with foreign key defined in A. */
/** One to one relationship between A and B with foreign key defined in B. */
db.Project.belongsTo(db.User);
db.User.hasMany(db.Project);

db.Task.belongsTo(db.Project);
db.Project.hasMany(db.Task);

db.Task.belongsTo(db.User, { as: 'sentBy', foreignKey: 'created_by' });
db.Task.belongsTo(db.User, { as: 'receivedBy', foreignKey: 'assigned_to' });
db.User.hasMany(db.Task);

/** JOIN TABLES Relationships */
db.User.belongsToMany(db.User, { through: 'Users_Friends', as: 'user', foreignKey: 'user_id' });
db.User.belongsToMany(db.User, { through: 'Users_Friends', as: 'friend', foreignKey: 'friend_id' });

db.User.belongsToMany(db.Task, { through: db.Message });
db.Task.belongsToMany(db.User, { through: db.Message });

db.Task.hasMany(db.Message);
db.Message.belongsTo(db.Task);
db.User.hasMany(db.Message);
db.Message.belongsTo(db.User);

// here we are putting the instance we created in line 28 into the object "db"
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
