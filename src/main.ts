import { app, BrowserWindow, Menu, dialog, shell } from 'electron';
import * as showdown from 'showdown';
import * as fs from 'fs';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow = null;

function createWindow() {
    win = new BrowserWindow({ width: 1024, height: 768, webPreferences: { nodeIntegration: true } });

    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open',
                    click: () => {
                        dialog.showOpenDialog({
                            properties: ['openFile'],
                            filters: [
                                { name: 'Markdown', extensions: ['md'] },
                            ]
                        }).then((fileNames) => {     
                            const fileName = fileNames.filePaths[0];
                            const text = fs.readFileSync(fileName, 'utf8');
     
                            const converter = new showdown.Converter();

                            const html:string = converter.makeHtml(text);

                            win.webContents.send('update', html);
                        });

                    }
                },
                {
                    label: 'Quit',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    win.loadFile('index.html');

    // Invoke an external browser to handle link
    const handleRedirect = (e: Event, url: string) => {
        if (url != win.webContents.getURL()) {
            e.preventDefault();
            shell.openExternal(url);
        }
    };

    win.webContents.on('will-navigate', handleRedirect);
    win.webContents.on('new-window', handleRedirect);

    win.on('closed', () => {
        win = null;
    });
}


app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
