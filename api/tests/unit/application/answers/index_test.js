const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/answers');

const AnswerController = require('../../../../lib/application/answers/answer-controller');

describe('Unit | Router | answer-router', function() {

  let httpTestServer;

  beforeEach(function() {
    sinon.stub(AnswerController, 'save').callsFake((request, h) => h.response().code(201));
    sinon.stub(AnswerController, 'get').callsFake((request, h) => h.response().code(200));
    sinon.stub(AnswerController, 'find').callsFake((request, h) => h.response().code(200));
    sinon.stub(AnswerController, 'update').callsFake((request, h) => h.response().code(204));

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('POST /api/answers', function() {

    it('should exist', async () => {
      // given
      const payload = {
        data: {
          attributes: {
            value: 'test',
            'elapsed-time': null,
            result: null,
            'result-details': null,
            timeout: null,
          },
          relationships: {},
          assessment: {},
          challenge: {},
          type: 'answers',
        },
      };
      // when
      const result = await httpTestServer.request('POST', '/api/answers', payload);

      // then
      expect(result.statusCode).to.equal(201);
    });
  });

  describe('GET /api/answers/{id}', function() {

    it('should exist', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/answers/1');

      // then
      expect(result.statusCode).to.equal(200);
    });
  });

  describe('GET /api/answers?assessment=<assessment_id>&challenge=<challenge_id>', function() {

    it('should exist', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/answers');

      // then
      expect(result.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/answers/{id}', function() {

    it('should exist', async () => {
      // when
      const result = await httpTestServer.request('PATCH', '/api/answers/1');

      // then
      expect(result.statusCode).to.equal(204);
    });
  });

});
