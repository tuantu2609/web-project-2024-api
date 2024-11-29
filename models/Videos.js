module.exports = (sequelize, DataTypes) => {
    const Videos = sequelize.define("Videos", {
      videoTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      videoDesc: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      videoURL: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      videoDuration: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("draft", "active", "rejected"),
        allowNull: false,
        defaultValue: "draft",
      },
    });

    Videos.associate = (models) => {
      Videos.hasMany(models.CourseVideos, {
        foreignKey: "videoId",
        as: "CourseVideos", // Alias phải khớp với alias trong API
      });
    };
  
    return Videos;
  };
  