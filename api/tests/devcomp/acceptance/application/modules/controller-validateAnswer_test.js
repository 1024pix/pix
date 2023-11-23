import { expect } from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';

describe('Acceptance | Controller | modules-controller-validateAnswer', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/modules/:slug/element/:id/answers', function () {
    context('when given proposal is the correct answer', function () {
      it('should return valid CorrectionResponse', async function () {
        const moduleSlug = 'bien-ecrire-son-adresse-mail';
        const elementId = '29195dde-b603-488f-a554-f391fbdf3b24';
        const options = {
          method: 'POST',
          url: `/api/modules/${moduleSlug}/elements/${elementId}/answers`,
          payload: {
            data: {
              attributes: {
                'user-response': ['27244df5-7871-4096-b51d-8b1dbd65d2ad'],
              },
            },
          },
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('element-answers');
        expect(response.result.data.attributes['user-response-value']).to.equal('27244df5-7871-4096-b51d-8b1dbd65d2ad');
        expect(response.result.data.attributes['element-id']).to.equal('29195dde-b603-488f-a554-f391fbdf3b24');
        expect(response.result.included[0].attributes.status).to.equal('ok');
      });
    });

    context('when given proposal is the wrong answer', function () {
      it('should return invalid CorrectionResponse', async function () {
        const moduleSlug = 'bien-ecrire-son-adresse-mail';
        const elementId = '29195dde-b603-488f-a554-f391fbdf3b24';
        const options = {
          method: 'POST',
          url: `/api/modules/${moduleSlug}/elements/${elementId}/answers`,
          payload: {
            data: {
              attributes: {
                'user-response': ['d2c27595-39ed-4af6-8401-1a082874d97e'],
              },
            },
          },
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('element-answers');
        expect(response.result.included[0].attributes.status).to.equal('ko');
      });
    });
  });
});
