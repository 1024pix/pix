import { activityAnswerController } from '../../../../src/school/application/activity-answer-controller.js';
import * as moduleUnderTest from '../../../../src/school/application/activity-answer-route.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Application | Router | activity-answer-router', function () {
  describe('POST /api/pix1d/activity-answers', function () {
    context('nominal case', function () {
      it('saves the answer inside the given assessment', async function () {
        // given
        sinon.stub(activityAnswerController, 'save').callsFake((request, h) => h.response().created());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = {
          data: {
            attributes: {
              value: 'test',
              result: null,
              'result-details': null,
            },
            relationships: {
              challenge: {
                data: {
                  id: 'hee',
                },
              },
            },
            type: 'activity-answers',
          },
          meta: {
            assessmentId: '12345678',
          },
        };

        // when
        const response = await httpTestServer.request('POST', '/api/pix1d/activity-answers', payload);

        // then
        expect(response.statusCode).to.equal(201);
      });

      it('saves the answer for preview', async function () {
        // given
        sinon.stub(activityAnswerController, 'save').callsFake((request, h) => h.response().created());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = {
          data: {
            attributes: {
              value: 'test',
              result: null,
              'result-details': null,
            },
            relationships: {
              challenge: {
                data: {
                  id: 'hee',
                },
              },
            },
            type: 'activity-answers',
          },
          meta: {
            isPreview: true,
          },
        };

        // when
        const response = await httpTestServer.request('POST', '/api/pix1d/activity-answers', payload);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });

    context('when meta is invalid', function () {
      it('returns bad request error when neither isPreview nor assessmentId are given', async function () {
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = {
          data: {
            attributes: {
              value: 'test',
              result: null,
              'result-details': null,
            },
            relationships: {
              challenge: {
                data: {
                  id: 'hee',
                },
              },
            },
            type: 'activity-answers',
          },
        };

        const response = await httpTestServer.request('POST', '/api/pix1d/activity-answers', payload);

        expect(response.statusCode).to.equal(400);
      });

      it('returns bad request error when meta contains both isPreview and assessementId', async function () {
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = {
          data: {
            attributes: {
              value: 'test',
              result: null,
              'result-details': null,
            },
            relationships: {
              challenge: {
                data: {
                  id: 'hee',
                },
              },
            },
            type: 'activity-answers',
          },
          meta: {
            assessmentId: '12345678',
            isPreview: true,
          },
        };

        const response = await httpTestServer.request('POST', '/api/pix1d/activity-answers', payload);

        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
