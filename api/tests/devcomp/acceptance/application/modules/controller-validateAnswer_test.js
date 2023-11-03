import { expect } from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';

describe('Acceptance | Controller | modules-controller-validateAnswer', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/modules/answers', function () {
    context('when given proposal is the correct answer', function () {
      it('should return valid CorrectionResponse', async function () {
        const options = {
          method: 'POST',
          url: `/api/modules/answers`,
          payload: {
            moduleSlug: 'les-adresses-mail',
            elementId: 'z3b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p7',
            proposalSelectedId: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
          },
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('correction-responses');
        expect(response.result.data.attributes['global-result']).to.equal('ok');
      });
    });

    context('when given proposal is the wrong answer', function () {
      it('should return invalid CorrectionResponse', async function () {
        const options = {
          method: 'POST',
          url: `/api/modules/answers`,
          payload: {
            moduleSlug: 'les-adresses-mail',
            elementId: 'z3b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p7',
            proposalSelectedId: 'b5a4c3d2-e1f6-7g8h-9i0j-k1l2m3n4o5p6',
          },
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('correction-responses');
        expect(response.result.data.attributes['global-result']).to.equal('ko');
      });
    });
  });
});
