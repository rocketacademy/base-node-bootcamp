export default function initTaskModel(sequelize, DataTypes) {
  return sequelize.define(
    'task',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING,
      },
      accepted: {
        type: DataTypes.STRING,
      },
      due_date: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.STRING,
      },
      proj_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Projects',
          key: 'id',
        },
      },
      created_by: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      assigned_to: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      // The underscored option makes Sequelize reference snake_case names in the DB.
      underscored: true,
    },
  );
}
