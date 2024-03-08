import { generateCursor } from '../../../../lib/domain/services/pole-emploi-service.js';
import { createServer, expect, generateValidRequestAuthorizationHeaderForApplication } from '../../../test-helper.js';

describe('Acceptance | Application | Pole Emploi Controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/pole-emploi/envois', function () {
    context('Sucess case', function () {
      it('returns a 200 HTTP status code', async function () {
        // given
        const POLE_EMPLOI_CLIENT_ID = 'poleEmploiClientId';
        const POLE_EMPLOI_SCOPE = 'pole-emploi-participants-result';
        const POLE_EMPLOI_SOURCE = 'poleEmploi';
        const curseur = await generateCursor({
          idEnvoi: 1,
          dateEnvoi: new Date(),
        });
        const request = {
          method: 'GET',
          url: `/api/pole-emploi/envois?curseur=${curseur}`,
          headers: {
            authorization: generateValidRequestAuthorizationHeaderForApplication(
              POLE_EMPLOI_CLIENT_ID,
              POLE_EMPLOI_SOURCE,
              POLE_EMPLOI_SCOPE,
            ),
          },
        };

        // when
        const { statusCode } = await server.inject(request);

        // then
        expect(statusCode).to.equal(200);
      });
    });
  });
});
