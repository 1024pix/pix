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
});
