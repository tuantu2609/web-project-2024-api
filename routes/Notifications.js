const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  deleteAllNotifications,
} = require("../controllers/notificationsController");
const { validateToken } = require("../middlewares/AuthMiddleware");

// Lấy danh sách thông báo
router.get("/", validateToken, getNotifications);

// Đánh dấu thông báo là đã đọc
router.patch("/:notificationId/read", validateToken, markNotificationAsRead);

// Xóa một thông báo
router.delete("/:notificationId", validateToken, deleteNotification);

// Xóa tất cả thông báo
router.delete("/", validateToken, deleteAllNotifications);

module.exports = router;
