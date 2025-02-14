const fs = require('fs');
const path = require('path');
const multer = require('multer');


const createUploadDir = () => {
  const uploadPath = path.join(__dirname, 'uploads', 'assets');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
};

createUploadDir(); 


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/assets'); 
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); 
  }
});


const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, 
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb); 
  }
}).single('image');


function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true); 
  } else {
    cb('Error: Images Only!');
  }
}

module.exports = upload;
