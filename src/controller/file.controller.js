const fs = require('fs/promises');
const path = require('path');
const util = require("util");
const multer = require("multer");
const Str = require('@supercharge/strings')
const uploadsFolder = "/resources/static/assets/uploads/";
let fileId = 0;
// 50GB limit
const maxSize = 50 * 1024 * 1024 * 1024;

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + uploadsFolder+fileId+"/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);

async function getFile(id) {
  const path = getPath(id);
  const file = await fs.readdir(path, function (err, files) {
    //handling error
    if (err) {
      console.log("Unable to scan directory: " + err);
    }
  });
  return file;
}

function getPath(id) {
  return __basedir + uploadsFolder + id + "/";
}

const upload = async (req, res) => {
  try {
    fileId = Str.random(30)  
    const fs = require('fs');
    const dir = "."+uploadsFolder+fileId+"/";
    fs.mkdir(dir, (err) => {
      if (err) {
          throw err;
      }
  });
    await uploadFileMiddleware(req, res);

    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }
    res.status(200).send({
      message: "Uploaded the file successfully: " + req.file.originalname,
      url: fileId
    });
  } catch (err) {
    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 5GB!",
      });
    } else {
      res.status(500)
    }
  }
};

const getDetails = async (req, res) => {
  try {
    const fileId = req.params.id;
    const fileName = await getFile(fileId);

    res.status(200).send({
      message: "File exists",
      fileName: fileName
    });
  } catch (err) {
    res.status(400).send({
      message: "File does not exist",
    });
  };
};

const download = async (req, res) => {
  try {
    const fileId = req.params.id;
    const fileName = await getFile(fileId);

    res.download(getPath(fileId) + fileName, fileName, (err) => {
      if (err) {
        res.status(500).send({
          message: "Could not download the file. " + err,
        });
      }
    });
  } catch (err) {
    res.status(400).send({
      message: "Could not download the file. " + err,
    });
  }
};

module.exports = {
  upload,
  getDetails,
  download,
};
