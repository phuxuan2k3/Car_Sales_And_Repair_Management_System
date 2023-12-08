const {StatusCodes} = require('http-status-codes')

module.exports = {
    NotFound: (req,res,next) => {
        const err = new Error("File not found!");
        err.statuscode = StatusCodes.NOT_FOUND;
        next(err);
    },

    HandleError: (err,req,res,next) => {
        if(!err.statuscode) err.statuscode = StatusCodes.INTERNAL_SERVER_ERROR;
        res.render('error',{statusCode: err.statuscode, errorContent: err});
    }

}