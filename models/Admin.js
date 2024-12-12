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

    Admin.sync().then(async () => {
        // Check if the admin table already has a record
        const count = await Admin.count();
        if (count === 0) {
            // Create the default admin account
            const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash('adminTNT', saltRounds);

            await Admin.create({
                username: 'admin',
                email: 'admin@example.com',
                password: hashedPassword, // Store the hashed password
            });
            console.log('Default admin account created successfully!');
        }
    });

    return Admin;
};