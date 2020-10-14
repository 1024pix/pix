const chai = require('chai');
const expect = chai.expect;
const axios = require('axios');

describe('API /api/users/me', () => {

  it('returns 401  when user is not authenticated', async () => {
    const  requestUrl = 'http://localhost:3000/api/users/me';
    let response = null;
    try {
      await axios.get(requestUrl);
    } catch (error) {
      response = error.response;
    }
    expect(response.status).to.equal(401);
  });

  it('returns 200 when user is authenticated', async () => {

    const email = 'sco@example.net';
    const authenticateUrl = 'http://localhost:3000/api/token';
    const payload = 'grant_type=password&username=' + email + '&password=pix123&scope=mon-pix';

    const authenticateResponse = await axios({ method: 'post', url: authenticateUrl, data: payload });
    console.log(authenticateResponse);

    const config = {
      headers: { Authorization: `Bearer ${authenticateResponse.data.access_token}` }
    };

    const requestUrl = 'http://localhost:3000/api/users/me';
    const response = await axios.get(requestUrl, config);

    console.log(response);
    expect(response.status).to.equal(200);
    expect(response.data.data.attributes.email).to.equal(email);
    
  });

});
