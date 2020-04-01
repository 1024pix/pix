const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const AnswerController = require('../../../../lib/application/answers/answer-controller');

describe('Unit | Router | answer-router', function() {

  let server;

  beforeEach(function() {

    sinon.stub(AnswerController, 'save').callsFake((request, h) => h.response().code(201));
    sinon.stub(AnswerController, 'get').callsFake((request, h) => h.response().code(200));
    sinon.stub(AnswerController, 'find').callsFake((request, h) => h.response().code(200));
    sinon.stub(AnswerController, 'update').callsFake((request, h) => h.response().code(204));

    server = Hapi.server();

    return server.register(require('../../../../lib/application/answers'));
  });

  afterEach(() => {
    server.stop();
  });

  describe('POST /api/answers', function() {

    it('should exist', async () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/answers'
      };

      // when
      const result = await server.inject(options);

      // then
      expect(result.statusCode).to.equal(201);
    });
  });

  describe('GET /api/answers/{id}', function() {

    it('should exist', async () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/answers/answer_id'
      };

      // when
      const result = await server.inject(options);

      // then
      expect(result.statusCode).to.equal(200);
    });
  });

  describe('GET /api/answers?assessment=<assessment_id>&challenge=<challenge_id>', function() {

    it('should exist', async () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/answers'
      };

      // when
      const result = await server.inject(options);

      // then
      expect(result.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/answers/{id}', function() {

    it('should exist', async () => {
      // given
      const options = {
        method: 'PATCH',
        url: '/api/answers/answer_id'
      };

      // when
      const result = await server.inject(options);

      // then
      expect(result.statusCode).to.equal(204);
    });
  });

});
