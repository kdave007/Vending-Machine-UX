///**** Options ****///
var productionMode = false;  // Enable or disable production mode
var openDevTools   = false;  // Show or hide developer tools
var fullscreen     = true; // Set window mode
///*****************///


const { app, BrowserWindow } = require('electron')

require('electron-debug')({showDevTools: openDevTools}); // Set to false on production

let win;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1920, 
    height:1080,
    backgroundColor: '#ffffff',
    icon: `file://${__dirname}/dist/assets/logo.png`,

    webPreferences: {
        nodeIntegration: !productionMode
    }
  })


  win.loadURL(`file://${__dirname}/dist/index.html`)

  win.setAutoHideMenuBar(true);
  win.setFullScreen(fullscreen);

  // Event when the window is closed.
  win.on('closed', function () {
    win = null
  })
}

// Create window on electron intialization
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow()
  }
})