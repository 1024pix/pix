const { expect } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Application | Route | Healthcheck', () => {

  describe('GET /api', () => {

    let options;

    beforeEach(() => {
      options = {
        method: 'GET',
        url: '/api',
      };
    });

    it('should return 200 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/healthcheck/db', () => {

    let options;

    beforeEach(() => {
      options = {
        method: 'GET',
        url: '/api/healthcheck/db',
      };
    });

    it('should return 200 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/healthcheck/crash', () => {

    let options;

    beforeEach(() => {
      options = {
        method: 'GET',
        url: '/api/healthcheck/crash',
      };
    });

    it('should return 500 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(500);
      });
    });
  });

});
