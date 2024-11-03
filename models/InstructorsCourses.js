module.exports = (sequelize, DataTypes) => {
    const InstructorsCourses = sequelize.define("InstructorsCourses", {
      instructorId: {
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
      assignedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  
    return InstructorsCourses;
  };
  