"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const showdown = require("showdown");
const fs = require("fs");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null;
function createWindow() {
    win = new electron_1.BrowserWindow({ width: 1024, height: 768 });
    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open',
                    click: () => {
                        electron_1.dialog.showOpenDialog({
                            properties: ['openFile'],
                            filters: [
                                { name: 'Markdown', extensions: ['md'] },
                            ]
                        }, function (fileNames) {
                            if (fileNames === undefined)
                                return;
                            let fileName = fileNames[0];
                            let text = fs.readFileSync(fileName, 'utf8');
                            let converter = new showdown.Converter();
                            let html = converter.makeHtml(text);
                            win.webContents.send('update', html);
                        });
                    }
                },
                {
                    label: 'Quit',
                    click: () => {
                        electron_1.app.quit();
                    }
                }
            ]
        }
    ];
    const menu = electron_1.Menu.buildFromTemplate(menuTemplate);
    electron_1.Menu.setApplicationMenu(menu);
    win.loadFile('index.html');
    // Invoke an external browser to handle link
    let handleRedirect = (e, url) => {
        if (url != win.webContents.getURL()) {
            e.preventDefault();
            require('electron').shell.openExternal(url);
        }
    };
    win.webContents.on('will-navigate', handleRedirect);
    win.webContents.on('new-window', handleRedirect);
    win.on('closed', () => {
        win = null;
    });
}
electron_1.app.on('ready', createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map