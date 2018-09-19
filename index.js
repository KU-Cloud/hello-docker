'use strict';

const promisify = require('util').promisify;
const os = require('os');
const fs = require('fs');
const path = require('path');
const express = require('express');
const outdent = require('outdent');
const lockfile = require('proper-lockfile');

const PORT = 8080;
const HOST = '0.0.0.0';
const CACHE_PATH =  process.argv[2] || '/data';
const LAST_CACHE_FILENAME = '.last';

function touchSync(path){
    if (fs.existsSync(path)) return;
    fs.closeSync(fs.openSync(path, 'w'));
}

((logPath)=>{
    if(fs.existsSync(logPath)) return;
    fs.mkdirSync(logPath);
})(CACHE_PATH)

const writeLog = ((cacheTo) => {
    touchSync(cacheTo);

    const rf = promisify(fs.readFile);
    const wf = promisify(fs.writeFile);

    function readLast(){ return rf(cacheTo); }
    function writeLast(msg){ return wf(cacheTo, msg, {
        flags: 'w'
    }); }

    return (msg) => {
        let last = null;
        let release = null;

        return lockfile.lock(cacheTo).then((_release)=>{
            release = _release;
            return readLast();
        }).then((lastMsg)=>{
            last = lastMsg;
            return writeLast(msg);
        }).then(()=>{
            release();
            return last;
        });
    }
})(
    path.join(CACHE_PATH, LAST_CACHE_FILENAME)
);

const app = express();
app.get('/', (req, res) => {
    res.send(
        outdent`Hello Container!
                Total memory size of container: ${(os.totalmem() / 1024 / 1024)} MiB` + '\n');
}).get('/:whatever', (req, res) => {
    const msg = `${Date.now()},${req.params.whatever}`;
    console.log(msg);
    writeLog(msg).then((last)=>{
        res.send('' + last + '\n' + msg + '\n');
    });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);