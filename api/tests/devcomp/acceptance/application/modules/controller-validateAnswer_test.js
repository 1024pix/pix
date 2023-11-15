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
        const elementId = 'z3b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p7';
        const options = {
          method: 'POST',
          url: `/api/modules/${moduleSlug}/elements/${elementId}/answers`,
          payload: {
            data: {
              attributes: {
                'user-response': ['a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6'],
              },
            },
          },
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('element-answers');
        expect(response.result.data.attributes['user-response-value']).to.equal('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6');
        expect(response.result.data.attributes['element-id']).to.equal('z3b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p7');
        expect(response.result.included[0].attributes.status).to.equal('ok');
      });
    });

    context('when given proposal is the wrong answer', function () {
      it('should return invalid CorrectionResponse', async function () {
        const moduleSlug = 'bien-ecrire-son-adresse-mail';
        const elementId = 'z3b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p7';
        const options = {
          method: 'POST',
          url: `/api/modules/${moduleSlug}/elements/${elementId}/answers`,
          payload: {
            data: {
              attributes: {
                'user-response': ['b5a4c3d2-e1f6-7g8h-9i0j-k1l2m3n4o5p6'],
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
