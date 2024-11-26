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
  
    return Videos;
  };
  