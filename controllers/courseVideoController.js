const { Videos, CourseVideos } = require("../models");

const getVideosByCourseID = async (req, res) => {
    const { courseId } = req.params;
    try {
      const videos = await CourseVideos.findAll({
        where: { courseId },
        include: [
          {
            model: Videos,
            as: "Video",
            attributes: ['videoTitle', 'videoDesc', 'videoURL', 'videoDuration'],
          },
        ],
      });
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };

module.exports = {
  getVideosByCourseID,
};
