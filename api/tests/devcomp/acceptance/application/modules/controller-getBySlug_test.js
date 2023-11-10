import { expect } from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';

describe('Acceptance | Controller | modules-controller-getBySlug', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/modules/:slug', function () {
    context('when module exists', function () {
      it('should return module', async function () {
        const options = {
          method: 'GET',
          url: `/api/modules/bien-ecrire-son-adresse-mail`,
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('modules');
      });
    });

    context('when module does not exist', function () {
      it('should return 404', async function () {
        const options = {
          method: 'GET',
          url: `/api/modules/dresser-des-pokemons`,
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(404);
      });
    });
  });
});
