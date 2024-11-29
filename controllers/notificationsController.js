const { Notifications } = require("../models"); // Import model Notifications

/**
 * Lấy danh sách thông báo cho người dùng hiện tại
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy userId từ token đã giải mã trong middleware validateToken

    // Lấy danh sách thông báo theo userId
    const notifications = await Notifications.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]], // Sắp xếp theo ngày tạo, mới nhất trước
    });

    res.status(200).json(notifications); // Trả về danh sách thông báo
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Đánh dấu một thông báo là đã đọc
 */
const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notifications.findByPk(notificationId);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Cập nhật trạng thái thông báo thành "read"
    await notification.update({ status: "read" });

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Xóa một thông báo
 */
const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notifications.findByPk(notificationId);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Xóa thông báo
    await notification.destroy();

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Xóa tất cả thông báo của người dùng
 */
const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy userId từ token

    // Xóa tất cả thông báo của người dùng
    await Notifications.destroy({ where: { userId } });

    res.status(200).json({ message: "All notifications deleted successfully" });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  deleteAllNotifications,
};
