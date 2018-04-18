const { expect, generateValidRequestAuhorizationHeader } = require('../../test-helper');
const server = require('../../../server');
const _ = require('lodash');

describe('Acceptance | API | Certifications', () => {

  describe('GET /api/certifications', () => {

    let options;

    it('should return 200 HTTP status code', () => {
      options = {
        method: 'GET',
        url: '/api/certifications',
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      };
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });


    it('should return 401 HTTP status code if certification not found', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/certifications',
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
