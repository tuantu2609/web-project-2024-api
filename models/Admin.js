const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define("Admin", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        }
    });

    Admin.beforeCreate(async (admin, options) => {
        const count = await Admin.count();
        if (count > 0) {
            throw new Error("Only one admin account is allowed.");
        }
    });

    return Admin;
};
