module.exports = (sequelize, DataTypes) => {
    const Notifications = sequelize.define("Notifications", {
      userId: { // ID của người nhận thông báo
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Accounts", // Bảng Accounts
          key: "id",
        },
      },
      message: { // Nội dung thông báo
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("courseApproval", "studentEnrollment", "courseDeletion", "courseRejection", "videoDeletion"),
        allowNull: false,
      },
      status: { // Trạng thái thông báo (đã đọc hay chưa)
        type: DataTypes.ENUM("unread", "read"),
        allowNull: false,
        defaultValue: "unread",
      },
      createdAt: { // Ngày tạo thông báo
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  
    Notifications.associate = (models) => {
      Notifications.belongsTo(models.Accounts, {
        foreignKey: "userId",
        as: "User",
        onDelete: "CASCADE",
      });
    };
  
    return Notifications;
  };
  