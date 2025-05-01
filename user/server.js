var express = require('express');

app = express();

app.use(express.static(__dirname))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});