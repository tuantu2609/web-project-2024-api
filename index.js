const express = require("express");
const app = express();
const cors = require("cors");
const { swaggerUi, swaggerSpec } = require("./swagger");

app.use(express.json());
app.use(cors());
require("dotenv").config();

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


db.sequelize.sync().then(() => {
  app.listen(3001, () => {
    console.log("Server running on port 3001");
  });
});
