const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    // this will make sure that the name of the file of the server 
//will be the same as the name of the file o the client side.
//if you don't set the file.orginalName, Multer by default will give some random string as the name of the file. 
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);  //false, tells Multer to reject file uploads
    }
    cb(null, true);  //null means no error, true to accept the file. 
};

//call multer function 
const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router(); //call the uploadRouter to handle various http requests

uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})

//Multer middleware: upload.single
//when a client uploads a image file,  multer will take over and handle processing it. 
//files sucessfully uploading = 200. 
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

module.exports = uploadRouter;


