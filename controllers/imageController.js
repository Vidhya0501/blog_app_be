import grid from "gridfs-stream";
import mongoose from "mongoose";

const url = "http://localhost:5175";

let gfs;
const conn = mongoose.connection;

// Initialize GridFS
conn.once("open", () => {
  gfs = grid(conn.db, mongoose.mongo);
  gfs.collection("fs");
});

export const uploadImage = (req, res) => {
  if (!req.file) return res.status(404).json({ error: "File not found" });

  const imageUrl = `${url}/file/${req.file.filename}`;

  res.status(200).json({ imageUrl });
};

export const getImage = async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    const readStream = gfs.createReadStream(file.filename);
    readStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
