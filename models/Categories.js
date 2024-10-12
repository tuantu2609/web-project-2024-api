module.exports = (sequelize, DataTypes) => {
    const Categories = sequelize.define("Categories", {
        categoryName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });
  
    return Categories;
  };