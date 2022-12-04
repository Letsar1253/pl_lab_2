const express = require('express');
const fileUpload = require("express-fileupload")
const app = express();
const port = 1337;

app.use(function (request, response, next) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
    response.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(fileUpload({}));

require('./routers')(app);

app.listen(port, () => {
    console.log('Server started on localhost:' + port);
})