import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { stageCollectionController } from '../../../../../src/evaluation/application/stage-collections/stage-collection-controller.js';
import * as moduleUnderTest from '../../../../../src/evaluation/application/scorecards/index.js';

describe('Unit | Router | stage-collections', function () {
  describe('PATCH /api/admin/stage-collections/{id}', function () {
    it('should return a 404 HTTP status code when type property is not valid in payload', async function () {
      // given
      sinon.stub(stageCollectionController, 'update').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const options = {
        method: 'PATCH',
        url: '/api/admin/stage-collections/1',
        payload: {
          type: 'WRONG_TYPE',
          attributes: {
            stages: [Symbol()],
          },
        },
      };

      // when
      const response = await httpTestServer.request(options.method, options.url);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return a 404 HTTP status code when no stage exist in payload', async function () {
      // given
      sinon.stub(stageCollectionController, 'update').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const options = {
        method: 'PATCH',
        url: '/api/admin/stage-collections/1',
        payload: {
          type: 'stage-collections',
          attributes: {
            stages: [],
          },
        },
      };

      // when
      const response = await httpTestServer.request(options.method, options.url);

      // then
      expect(response.statusCode).to.equal(404);
    });
  });
});
