const { expect, generateValidRequestAuhorizationHeader } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Interface | Controller | SecurityController', function() {

  describe('#checkUserIsAuthenticated', () => {

    it('should disallow access resource with well formed JSON API error', () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/organizations',
        payload: {}
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const jsonApiError = {
          errors: [{
            code: 401,
            title: 'Unauthorized access',
            detail: 'Missing or invalid access token in request auhorization headers.'
          }]
        };
        expect(response.statusCode).to.equal(401);
        expect(response.result).to.deep.equal(jsonApiError);
      });
    });
  });

  describe('#checkUserHasRolePixMaster', () => {

    it('should return a well formed JSON API error when user in not authorized', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/feedbacks',
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const jsonApiError = {
          errors: [{
            code: 403,
            title: 'Forbidden access',
            detail: 'Missing or insufficient permissions.'
          }]
        };
        expect(response.statusCode).to.equal(403);
        expect(response.result).to.deep.equal(jsonApiError);
      });
    });

  });

});
