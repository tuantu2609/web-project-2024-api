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
        allowNull: false, // Không cho phép null
        defaultValue: 0,
      },
      completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    });

    Enrollments.associate = (models) => {
      Enrollments.belongsTo(models.Courses, {
        foreignKey: "courseId",
        as: "Course", // Alias để gọi trong include
        onDelete: "CASCADE",
      });
  
      Enrollments.belongsTo(models.Accounts, {
        foreignKey: "studentId",
        as: "Student",
        onDelete: "CASCADE",
      });
    };
  
    return Enrollments;
  };
  