const express = require("express");
const app = express();
const cors = require("cors"); //Dung de bao mat
const { swaggerUi, swaggerSpec } = require('./swagger'); // Đường dẫn tới file swagger.js

app.use(express.json());
app.use(cors());

require('dotenv').config();

const db = require("./models");


// Tích hợp Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routers
const videoRouter = require("./routes/Videos");
app.use("/videos", videoRouter);
const userRouter = require("./routes/Users");
app.use("/auth", userRouter);

db.sequelize.sync().then(() => {
    app.listen(3001, () => {
      console.log("Server running on port 3001");
    });
  });