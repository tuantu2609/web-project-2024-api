module.exports = (sequelize, DataTypes) => {
    const Accounts = sequelize.define("Accounts", {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });

    Accounts.associate = (models) => {
      Accounts.hasOne(models.UserDetails, {
        foreignKey: "accountId",
        onDelete: "CASCADE",
      });
  
      Accounts.hasMany(models.Courses, {
        foreignKey: "instructorId",
        onDelete: "CASCADE",
      });
  
      Accounts.hasMany(models.Enrollments, {
        foreignKey: "studentId",
        onDelete: "CASCADE",
      });
    };

    return Accounts;
  };