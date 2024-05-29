import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  generateValidRequestAuthorizationHeaderForApplication,
  sinon,
} from '../../../../test-helper.js';

const poleEmploiSendingFactory = databaseBuilder.factory.poleEmploiSendingFactory;

import { config as settings } from '../../../../../lib/config.js';
import { generateCursor } from '../../../../../src/prescription/campaign-participation/domain/services/pole-emploi-service.js';

describe('Acceptance | API | Pole Emploi envois', function () {
  let server, options;

  const POLE_EMPLOI_CLIENT_ID = 'poleEmploiClientId';
  const POLE_EMPLOI_SCOPE = 'pole-emploi-participants-result';
  const POLE_EMPLOI_SOURCE = 'poleEmploi';

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/pole-emploi/envois', function () {
    beforeEach(function () {
      sinon.stub(settings.apiManager, 'url').value('https://url-externe');
    });

    context('when providing a cursor', function () {
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
    context('When the request returns 200', function () {
      it('should return the sending and a link', async function () {
        const sending = poleEmploiSendingFactory.buildWithUser(
          {
            id: 76345,
            createdAt: new Date('2021-05-01'),
            payload: {
              campagne: {
                nom: 'Campagne PE',
                dateDebut: new Date('2020-08-01'),
                type: 'EVALUATION',
                codeCampagne: 'POLEEMPLOI123',
                urlCampagne: 'https://app.pix.fr/campagnes/POLEEMPLOI123',
                nomOrganisme: 'Pix',
                typeOrganisme: 'externe',
              },
              individu: { nom: 'Kamado', prenom: 'Tanjiro' },
              test: {
                etat: 2,
                typeTest: 'DI',
                referenceExterne: 123456,
                dateDebut: new Date('2020-09-01'),
                elementsEvalues: [],
              },
            },
            isSuccessful: true,
          },
          'externalUserId',
        );
        poleEmploiSendingFactory.buildWithUser({ isSuccessful: false });
        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: '/api/pole-emploi/envois?enErreur=false',
          headers: {
            authorization: generateValidRequestAuthorizationHeaderForApplication(
              POLE_EMPLOI_CLIENT_ID,
              POLE_EMPLOI_SOURCE,
              POLE_EMPLOI_SCOPE,
            ),
          },
        };

        //when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.headers.link).to.equal(
          'https://url-externe/pole-emploi/envois?curseur=eyJpZEVudm9pIjo3NjM0NSwiZGF0ZUVudm9pIjoiMjAyMS0wNS0wMVQwMDowMDowMC4wMDBaIn0=&enErreur=false',
        );
        expect(response.result).to.deep.equal([
          {
            idEnvoi: sending.id,
            dateEnvoi: new Date('2021-05-01'),
            resultat: {
              campagne: {
                nom: 'Campagne PE',
                dateDebut: '2020-08-01T00:00:00.000Z',
                type: 'EVALUATION',
                codeCampagne: 'POLEEMPLOI123',
                urlCampagne: 'https://app.pix.fr/campagnes/POLEEMPLOI123',
                nomOrganisme: 'Pix',
                typeOrganisme: 'externe',
              },
              individu: {
                nom: 'Kamado',
                prenom: 'Tanjiro',
                idPoleEmploi: 'externalUserId',
              },
              test: {
                etat: 2,
                typeTest: 'DI',
                referenceExterne: 123456,
                dateDebut: '2020-09-01T00:00:00.000Z',
                elementsEvalues: [],
              },
            },
          },
        ]);
      });
    });

    context('When the request has failed', function () {
      it('should return 403 HTTP status code if user is not allowed to access', async function () {
        // given
        options = {
          method: 'GET',
          url: '/api/pole-emploi/envois',
          headers: {
            authorization: generateValidRequestAuthorizationHeaderForApplication(
              POLE_EMPLOI_CLIENT_ID,
              POLE_EMPLOI_SOURCE,
            ),
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should return 401 HTTP status code if user is not authenticated', async function () {
        // given
        options = {
          method: 'GET',
          url: '/api/pole-emploi/envois',
          headers: { authorization: generateValidRequestAuthorizationHeader() },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
