const { expect, sinon, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const Hapi = require('hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const courseController = require('../../../../lib/application/courses/course-controller');

describe('Integration | Router | course-router', () => {

  let sandbox;
  let server;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, reply) => reply(true));
    sandbox.stub(courseController, 'list').callsFake((request, reply) => reply('ok'));
    sandbox.stub(courseController, 'get').callsFake((request, reply) => reply('ok'));
    sandbox.stub(courseController, 'refresh').callsFake((request, reply) => reply('ok'));
    sandbox.stub(courseController, 'save').callsFake((request, reply) => reply('ok'));
    sandbox.stub(courseController, 'refreshAll').callsFake((request, reply) => reply('ok'));

    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/courses') });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('GET /api/courses', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/courses'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/courses/{id}', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/courses/course_id'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });

  describe('POST /api/courses/{id}', () => {

    let options;

    beforeEach(() => {
      options = {
        method: 'POST',
        url: '/api/courses/1234',
        headers: {}
      };

    });

    it('should exist', () => {
      // given
      options.headers.authorization = generateValidRequestAuhorizationHeader();

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });

  });

  describe('PUT /api/courses', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/courses'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });

  describe('POST /api/courses', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/courses'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });
});
