module.exports = {
    tryCatchMiddleware: (controller) => async (req, res, next) => {
        try {
            await controller(req, res);
        } catch (error) {
            return next(error);
        }
    },
    tryCatchFunction: (fn) => {
        return async function (...args) {
            try {
                return await fn(...args);
            } catch (error) {
                throw error;
            }
        };
    }
}