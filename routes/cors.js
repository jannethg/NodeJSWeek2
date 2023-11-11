const cors = require ('cors');

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];

const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header('Origin'));
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };  //checking if origin can be found on the whitelist, allowing this request to be accepted.
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);   //null means no error has occured and giving it corsOption object.

};


exports.cors = cors();  //return to us a middleware function 
exports.corsWithOptions = cors(corsOptionsDelegate);  //return a middleware function, checks to see if request belongs to the whitelist origins localhost3000 / localhost3443