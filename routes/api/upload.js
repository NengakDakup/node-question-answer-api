const express = require('express');
const router = express.Router();
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
   destination: "./public/uploads/",
   filename: function(req, file, cb){
      cb(null,"IMAGE-" + Date.now() + path.extname(file.originalname));
   }
});

const upload = multer({
   storage: storage,
   limits:{fileSize: 1000000},
}).single("image");


// @route   GET api/upload/test
// @desc    Tests upload route
// @access  public
router.get('/test', (req, res) => res.json({msg: 'upload Works!'}));

// @route   GET api/upload/question
// @desc    Upload an image fro a question
// @access  public
router.post("/question", (req, res) => {
   upload(req, res, (err) => {
      // image is stored in req.file
      /*Now do where ever you want to do*/
      if(err) return res.status(400).json({error: err});
      return res.status(200).json({upload: req.file});
   })
});

module.exports = router;
