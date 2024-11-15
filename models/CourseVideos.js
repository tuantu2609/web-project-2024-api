module.exports = (sequelize, DataTypes) => {
    const CourseVideos = sequelize.define("CourseVideos", {
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
      },
      videoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Videos",
          key: "id",
        },
      },
    });

    CourseVideos.associate = (models) => {
      CourseVideos.belongsTo(models.Videos, {
        foreignKey: "videoId",
        as: "Video",
      });
    
      CourseVideos.belongsTo(models.Courses, {
        foreignKey: "courseId",
        as: "Course",
      });
    };
  
    return CourseVideos;
  };
  