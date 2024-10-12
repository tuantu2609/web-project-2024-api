module.exports = (sequelize, DataTypes) => {
    const Videos = sequelize.define("Videos", {
        videoTitle: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        videoDesc: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        videoURL: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });
  
    return Videos;
  };