'use strict';

const os = require('os');
const express = require('express');

const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();
app.get('/', (req, res)=>{
    res.send(
`Hello Container! <br> 
Totla memory size of container: ${(os.totalmem() / 1024 / 1024)} MiB
`);
});

app.get('/:whatever', (req, res)=>{
    res.send(req.params.whatever);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);