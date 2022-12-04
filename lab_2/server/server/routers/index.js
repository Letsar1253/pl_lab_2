const filesRouter = require('./filesRouter');

module.exports = function (app) {
    filesRouter(app);
}