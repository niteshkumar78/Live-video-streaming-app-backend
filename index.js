const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use(express.static(__dirname + "/public"));

var listFilePath = "public/" + "list.txt";
var outputFilePath = "public/videos/" + "video3.mp4";
// http.globalAgent.maxSockets = 20;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(req.body);
    cb(null, `public/${req.body.userId}/videos/`);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-video2.mp4");
  },
});

var upload = multer({ storage: storage });

// var upload = multer({
//   dest: __dirname + "/public/",
// });
// var type = upload.single("upl");

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

// app.use(express.static(__dirname + "/img"));

app.post("/get-stream/", upload.single("file"), async (req, res) => {
  //   console.log(req.body.data);
  // console.log(req.body.userId);
  console.log(req.file);
  // var files = fs.readdirSync("public/videos/");
  // var list = "";
  // files.forEach((file, index) => {
  //   list += `file videos/${file}`;
  //   list += "\n";

  //   console.log(index, file);
  // });
  // var writeStream = fs.createWriteStream(listFilePath);

  // writeStream.write(list);

  // writeStream.end();

  // console.log(files);
  // exec(
  //   `ffmpeg -safe 0 -f concat -i ${listFilePath} -c copy ${
  //     "public/" + "output.mp4"
  //   }`,
  //   (error, stdout, stderr) => {
  //     if (error) {
  //       console.log(`error: ${error.message}`);
  //       return;
  //     } else {
  //       console.log("videos are successfully merged");

  //       // fs.unlinkSync(listFilePath);
  //       // fs.unlinkSync("public/" + "video1.mp4");
  //       // fs.unlinkSync("public/" + "video2.mp4");
  //       // fs.copyFile("public/video3.mp4", "public/video1.mp4", (err) => {
  //       //   if (err) throw err;
  //       //   console.log("source.txt was copied to destination.txt");
  //       //   fs.unlinkSync("public/" + "video3.mp4");
  //       // });
  //       // fs.unlinkSync("public/" + "video3.mp4");
  //     }
  //   }
  // );
  res.status(200).json({
    message: "Success",
  });
});

app.post("/register/", async (req, res) => {
  console.log(req.body);
  if (!fs.existsSync(`public/${req.body.userId}`)) {
    fs.mkdirSync(`public/${req.body.userId}`);
    fs.mkdirSync(`public/${req.body.userId}/videos`);

    fs.copyFile(
      "public/output.mp4",
      `public/${req.body.userId}/output.mp4`,
      (err) => {
        if (err) {
          console.log("Error Found:", err);
        }
      }
    );

    res.status(200).json({
      message: "success",
    });
  } else {
    res.status(200).json({
      message: "Failed",
    });
  }
});

app.post("/merge-videos/", async (req, res) => {
  var files = fs.readdirSync(`public/${req.body.userId}/videos/`);
  var list = "";
  files.forEach((file, index) => {
    list += `file videos/${file}`;
    list += "\n";

    console.log(index, file);
  });

  await fs.unlinkSync("public/" + req.body.userId + "/output.mp4");

  var writeStream = fs.createWriteStream(
    "public/" + req.body.userId + "/list.txt"
  );

  writeStream.write(list);

  writeStream.end();

  console.log(files);
  exec(
    `ffmpeg -safe 0 -f concat -i public/${req.body.userId}/list.txt -c copy ${
      "public/" + req.body.userId + "/output.mp4"
    }`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      } else {
        console.log("videos are successfully merged");

        // fs.unlinkSync(listFilePath);
        // fs.unlinkSync("public/" + "video1.mp4");
        // fs.unlinkSync("public/" + "video2.mp4");
        // fs.copyFile("public/video3.mp4", "public/video1.mp4", (err) => {
        //   if (err) throw err;
        //   console.log("source.txt was copied to destination.txt");
        //   fs.unlinkSync("public/" + "video3.mp4");
        // });
        // fs.unlinkSync("public/" + "video3.mp4");
      }
    }
  );
  res.status(200).json({
    message: "success",
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("App is running on port 8000");
});
