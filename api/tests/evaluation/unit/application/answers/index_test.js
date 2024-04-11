import { answerController } from '../../../../../src/evaluation/application/answers/answer-controller.js';
import * as moduleUnderTest from '../../../../../src/evaluation/application/answers/index.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Router | answer-router', function () {
  describe('POST /api/answers', function () {
    it('should return 201', async function () {
      // given
      sinon.stub(answerController, 'save').callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          attributes: {
            value: 'test',
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
      const response = await httpTestServer.request('POST', '/api/answers', payload);

      // then
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('GET /api/answers/{id}', function () {
    it('should return 200', async function () {
      //given
      sinon.stub(answerController, 'get').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/answers/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/answers/{id}', function () {
    it('should return 204', async function () {
      // given
      sinon.stub(answerController, 'update').callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/answers/1');

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('GET /api/answers', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(answerController, 'find').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/answers');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
