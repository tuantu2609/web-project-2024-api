module.exports = (sequelize, DataTypes) => {
    const Courses = sequelize.define("Courses", {
      courseTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      courseDesc: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });
  
    Courses.associate = (models) => {
      Courses.belongsTo(models.Accounts, {
        foreignKey: "instructorId",
        as: "Instructor",
        onDelete: "CASCADE",
      });
      
      Courses.hasMany(models.CourseVideos, {
        foreignKey: "courseId",
        onDelete: "cascade",
      });
      
      Courses.hasMany(models.Enrollments, {
        foreignKey: "courseId",
        onDelete: "cascade",
      });
    };
  
    return Courses;
  };
  