const express = require("express");
const app = express();
const cors = require("cors");
const { swaggerUi, swaggerSpec } = require("./swagger");
// const http = require("http");
// const { Server } = require("socket.io");

app.use(express.json());
app.use(cors());
require("dotenv").config();

// // Tạo HTTP server
// const server = http.createServer(app);

// // Tích hợp Socket.io với server
// const io = new Server(server, {
//   cors: {
//     origin: "*", // Cho phép tất cả các domain khác kết nối
//     methods: ["GET", "POST"],
//   },
// });

// // Lắng nghe sự kiện kết nối từ client
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   // Sự kiện gửi tin nhắn từ client
//   socket.on("send_notification", (data) => {
//     console.log("Notification received:", data);

//     // Phát lại tin nhắn cho tất cả người dùng
//     io.emit("receive_notification", data);
//   });

//   // Xử lý khi client ngắt kết nối
//   socket.on("disconnect", () => {
//     console.log("A user disconnected:", socket.id);
//   });
// });

const db = require("./models");

// Integrate Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routers
const authRouter = require("./routes/Users");
app.use("/auth", authRouter);
const userRouter = require("./routes/UserDetails");
app.use("/user", userRouter);
const courseRoutes = require("./routes/Courses");
app.use("/courses", courseRoutes);
const videoRouter = require("./routes/Videos");
app.use("/videos", videoRouter);
const courseVideoRouter = require("./routes/CourseVideo");
app.use("/courseVideo", courseVideoRouter);
const enrollmentRouter = require("./routes/Enrollment");
app.use("/enrollment", enrollmentRouter);
const adminRouter = require("./routes/Admin");
app.use("/admin", adminRouter);
const searchRouter = require("./routes/Search");
app.use("/search", searchRouter);
const notificationRouter = require("./routes/Notifications");
app.use("/notifications", notificationRouter);

// Test endpoint for CI/CD
app.get("/test-ci", (req, res) => {
  res.json({ message: "CI/CD Deployment Successful!!" });
});

db.sequelize.sync().then(() => {
  app.listen(3001, () => {
    console.log("Server running on port 3001");
  });
});
