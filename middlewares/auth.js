module.exports = {

    auth: (req,res,next) => {
        if(req.session.auth) {
            next();
        } else {
            const err = new Error("You must login before access this page!");
            next(err);
        }
        
    }
}