const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const app = express();

const indexController = require('./controllers/index');
const oauth2Controller = require('./controllers/oauth2');
const usersController = require('./controllers/users');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

/*
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
*/
app.use(cors());

app.get('/', indexController.helloWorld);
app.post('/token', oauth2Controller.getToken);
app.post('/revoke', oauth2Controller.revokeToken);
app.get('/users', usersController.findUsers);
app.get('/users/:user_id', usersController.getUser);
app.post('/users', usersController.createUser);

app.listen(9000, () => console.log('Example app listening on port 9000!'));
