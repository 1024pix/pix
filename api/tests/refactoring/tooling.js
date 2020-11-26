const axios = require('axios');

const createAccessToken = async function(user) {

  if (!user.scope) {
    user.scope = 'mon-pix';
  }

  const authenticateUrl = 'http://localhost:3000/api/token';
  const payload = 'grant_type=password&username=' + user.email + '&password=' + user.password + '&scope=' + user.scope;
  const authenticateResponse = await axios({ method: 'post', url: authenticateUrl, data: payload });
  return authenticateResponse.data.access_token;

};

module.exports = {
  createAccessToken,
};
