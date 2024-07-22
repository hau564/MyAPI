# Setup tutorial

## Install Node.js and npm on Windows

### Installer

* Go to https://nodejs.org/en.
* Download the installer that includes npm.

### Run installer 

### Verify

In cmd:
* node -v
* npm -v

## Run 

### Set up

* Clone project from github
* Open cmd in project's directory
* In cmd: ```npm install```
* Setup .env file

### Run
* In cmd: 
```npm run dev```


## Testing

To test:
* Open project folder in vscode.
* Run.
* Instal ```REST Client``` extension.
* Follow the examples in test.rest.

If you want to confirm email from other devices (including emulator on current device), in .env, find the ```ROOT_URL``` variable and change ```localhost``` to your ```Ipv4 address```

Note that it is not nessecery to confirm email on emulator.

To get your Ipv4, in cmd: ```ipconfig```

While testing, open the database on mongodb.com to see changes.