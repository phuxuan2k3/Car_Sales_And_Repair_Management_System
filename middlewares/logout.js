module.exports = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            throw err;
        }
        res.redirect('/');
        //Todo: or send json
    });
}