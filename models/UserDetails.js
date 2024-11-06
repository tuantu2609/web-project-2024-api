module.exports = (sequelize, DataTypes) => {
    const UserDetails = sequelize.define("UserDetails", {
      accountId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Accounts", 
          key: "id",
        },
        onDelete: "CASCADE",
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      birthDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      profilePictureURL: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    });
  
    return UserDetails;
  };
  