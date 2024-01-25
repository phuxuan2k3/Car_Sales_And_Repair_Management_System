module.exports = class AppError extends Error {
    constructor(statusCode, errorContent, redirectURL, redirectContent) {
        super(errorContent);
        this.statusCode = statusCode;
        this.redirectURL = redirectURL;
        this.redirectContent = redirectContent;
        if (!this.redirectURL) {
            this.redirectURL = '/';
            this.redirectContent = 'Back to Home Page';
        }
    }
}
