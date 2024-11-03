module.exports = (sequelize, DataTypes) => {
    const Enrollments = sequelize.define("Enrollments", {
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Accounts", 
          key: "id",
        },
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
      },
      enrollDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      progress: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    });
  
    return Enrollments;
  };
  