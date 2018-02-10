const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => res.send('Hello World!'));

app.post('/token', (req, res) => {
  console.log('/token');
  const { grant_type, username, password } = req.body ;
  return res.send({
    "access_token":"MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI3",
    "token_type":"bearer",
    "expires_in":3600,
    "refresh_token":"IwOGYzYTlmM2YxOTQ5MGE3YmNmMDFkNTVk"
  });
});

app.post('/revoke', (req, res) => {
  console.log('/revoke');
  const { token } = req.body;
  return res.send();
});

app.listen(9000, () => console.log('Example app listening on port 9000!'));
