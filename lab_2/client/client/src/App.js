import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [parent, setParent] = useState('');
  const [data, setData] = useState({
    path :  "",
    files: []
  });
  const [currentPath, setCurrentPath] = useState('');
  const [newFolderName, setNewFolderName] = useState("");

    const handleError = function (error) {
        alert(error.response.data.message);
    };

  useEffect(() => {
    fetch("http://localhost:1337/")
      .then(res => res.json())
      .then(
        (result) => {
            setParent('');
            setData(result);
            setCurrentPath(result.path);
        },
        (error) => {
            handleError(error);
        }
      )
    }, []);

    const clickLink = async function (event) {
        event.preventDefault();
        await axios.get("http://localhost:1337/?path="+event.target.attributes.href.value)
            .then(
                (result) => {
                    let data = result.data;
                    let linkArr = data.path.split('/');
                    linkArr.pop();
                    setParent(linkArr.join('/'));
                    setData(data);
                    setCurrentPath(data.path);
              },
              (error) => {
                  handleError(error);
              }
        );

    }

    const clickDownload = async function(event) {
        event.preventDefault();
        const response = await fetch("http://localhost:1337/download?filePath=" + event.target.attributes.href.value);

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = downloadUrl;
        let fileName = event.target.attributes.href.value.replace(/^.*[\\\/]/, '');
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    const clickDelete = async function (event) {
        event.preventDefault();
        await axios.delete("http://localhost:1337/delete?filePath=" + event.target.attributes.href.value)
            .then(() => {
                let pathArray = event.target.attributes.href.value.split('/');
                let fileName = pathArray.at(-1);
                let notDeletedFiles = data.files.filter(s => s.name !== fileName);
                let newData = {
                    path: "",
                    files: []
                };
                newData.path = data.path;
                newData.files = notDeletedFiles;
                setData(newData);
            });
    }

    const clickUpload = async function (event) {
        const files = [...event.target.files];
        for (const file of files) 
            await uploadFile(file);
    }

    const addItem = function (newItem) {
        let currentFiles = data.files;
        currentFiles.push(newItem);
        let newData = {
            path: data.path,
            files: currentFiles
        };
        setData(newData);
    }

    const uploadFile = async function (file) {

        const formData = new FormData()
        formData.append('file', file)
        formData.append('currentPath', currentPath)

        await axios.post(`http://localhost:1337/upload`, formData)
            .then(
                (result) => {
                    addItem(result.data);
                },
                (error) => {
                    handleError(error);
                });
    };

       
        const createFolder = async function (fileName) {

            const folderPath = currentPath + '/' + fileName;

            await axios.post(`http://localhost:1337/createFolder${'?folderPath='+folderPath }`)
                .then(
                    (result) => {
                        addItem(result.data);
                    },
                    (error) => {
                        handleError(error);
                    });
        };

        const clickCreateFolder = async function () {
            await createFolder(newFolderName);
        };

  return (
    <div className="filesGrid">

      <div className="currentFolder">
            client: {data.path === '' ? '/' : data.path}
      </div>

      <ul className="filesList">
          {data.files.map(item =>{

              if (item.isDirectory) {
                return <li className="folder" key={item.name}>
                            <a href={data.path + '/' + item.name} onClick={clickLink}>
                            <span href={data.path + '/' + item.name} className="material-icons">&#xe2c7;</span>
                              {item.name.toUpperCase()}
                            </a>
                        </li>
              }
              else {
                  return <li className="file"  key={item.name}>
                          <span className="material-icons">&#xf1c6;</span>
                          {item.name}
                          <span className="fileAction">
                              <a href={data.path + '/' + item.name} onClick={clickDownload}>
                                  <span href={data.path + '/' + item.name} className="material-icons">&#xf090;</span>
                              </a>

                              <a href={data.path + '/' + item.name} onClick={clickDelete}>
                                  <span href={data.path + '/' + item.name} className="material-icons">&#xe872;</span>
                              </a>
                          </span>
                        </li>
              }

          })}
          </ul>

          <span>
              <a href={parent} onClick={clickLink}>
                  <span className="material-icons">&#xe5c4;</span>
                  Back
              </a>
          </span>

          <span id="upload">
              <a href={currentPath}>
                  <label htmlFor="uploadInput" >
                      <span className="material-icons">&#xf09b;</span>
                      Upload
                  </label>
                  <input id="uploadInput" multiple={true} onChange={(event) => clickUpload(event)} type="file" />
              </a>
          </span>

          <span id="createFolder">
              <a href={currentPath} onClick={clickCreateFolder}>
                  <span className="material-icons">&#xe2cc;</span>
                  Create folder
              </a>
                  <input id="createFolderInput" type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} />
          </span>

    </div>
  );
}

export default App;