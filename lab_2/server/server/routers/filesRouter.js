const fs = require("fs");
const path = require("path");

module.exports = function (app) {

    const basePath = '../../client';

    function isFolder(path) {
        return fs.lstatSync(path).isDirectory() && fs.existsSync(path);
    }

    app.get('/', (request, response) => {
        let path = '';

        if ('path' in request.query) {
            path = request.query.path;
        }

        let pathForItem = basePath + path;
        if (isFolder(pathForItem)) {
            let files = fs.readdirSync(pathForItem).map(item => {
                let pathForItemInFolder = pathForItem + '/' + item;
                const isDirectory = fs.lstatSync(pathForItemInFolder).isDirectory();

                return {
                    name: item,
                    isDirectory: isDirectory
                }
            });
            response.json({
                path: path,
                files: files
            });
        }

    });

    app.post('/createFolder', (request, response) => {
        let folderPath = basePath + request.query.folderPath;

        if (fs.existsSync(folderPath)) {
            return response.status(400).json({ message: 'Folder already exist' });
        }

        fs.mkdirSync(folderPath);
        let fileName = request.query.folderPath.split('/').at(-1);

        return response.json({
            name: fileName,
            isDirectory: true
        });
    });

    app.get('/download', (request, response) => {
        let filePath = basePath + request.query.filePath;
        let fileName = path.basename(filePath);

        response.download(filePath, fileName);
    });

    app.post('/upload', (request, response) => {
        const file = request.files.file;
        const currentPath = request.body.currentPath;

        let path = basePath + currentPath + '/' + file.name;

        if (fs.existsSync(path)) {
            return response.status(400).json({ message: 'File already exist' });
        }
        file.mv(path);

        return response.json({
            name: file.name,
            isDirectory: false
        });
    });

    app.delete('/delete', (request, response) => {
        let filePath = basePath + request.query.filePath;
        fs.unlinkSync(filePath);

        return response.sendStatus(200);
    });
}