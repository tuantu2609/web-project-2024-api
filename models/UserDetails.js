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
        validate: {
          is: /^[0-9]+$/i, // Chỉ cho phép các ký tự số
        },
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
  