const jsonwebtoken = require('jsonwebtoken');

const { expect, knex, databaseBuilder, generateValidRequestAuthorizationHeaderForApplication, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const poleEmploiSendingFactory = databaseBuilder.factory.poleEmploiSendingFactory;

const PoleEmploiTokens = require('../../../lib/domain/models/PoleEmploiTokens');
const poleEmploiTokensRepository = require('../../../lib/infrastructure/repositories/pole-emploi-tokens-repository');

const createServer = require('../../../server');
const settings = require('../../../lib/config');

describe('Acceptance | API | Pole Emploi Controller', function() {

  let server, options;

  const POLE_EMPLOI_CLIENT_ID = 'poleEmploiClientId';
  const POLE_EMPLOI_SCOPE = 'pole-emploi-participants-result';
  const POLE_EMPLOI_SOURCE = 'poleEmploi';

  beforeEach(async function() {
    server = await createServer();
  });

  describe('POST /api/pole-emplois/users?authentication-key=key', function() {

    const firstName = 'firstName';
    const lastName = 'lastName';
    const externalIdentifier = 'idIdentiteExterne';

    afterEach(async function() {
      await knex('authentication-methods').delete();
      await knex('users').delete();
    });

    it('should return 200 HTTP status', async function() {
      // given
      const idToken = jsonwebtoken.sign({
        'given_name': firstName,
        'family_name': lastName,
        nonce: 'nonce',
        idIdentiteExterne: externalIdentifier,
      }, 'secret');

      const poleEmploiTokens = new PoleEmploiTokens({
        accessToken: 'accessToken',
        expiresIn: 10,
        idToken,
        refreshToken: 'refreshToken',
      });
      const userAuthenticationKey = await poleEmploiTokensRepository.save(poleEmploiTokens);

      const request = {
        method: 'POST',
        url: `/api/pole-emplois/users?authentication-key=${userAuthenticationKey}`,
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);

      const createdUser = await knex('users').first();
      expect(createdUser.firstName).to.equal(firstName);
      expect(createdUser.lastName).to.equal(lastName);

      const createdAuthenticationMethod = await knex('authentication-methods').first();
      expect(createdAuthenticationMethod.externalIdentifier).to.equal(externalIdentifier);
    });
  });

  describe('GET /api/pole-emploi/envois', function() {
    const originalEnv = settings.apiManager.url;

    before(function() {
      settings.apiManager.url = 'https://url-externe';
    });

    after(function() {
      settings.apiManager.url = originalEnv;
    });

    context('When the request returns 200', function() {
      it('should return the sending and a link', async function() {
        const sending = poleEmploiSendingFactory.buildWithUser({ id: 76345, createdAt: new Date('2021-05-01'), payload: { campagne: { nom: 'Campagne PE', dateDebut: new Date('2020-08-01'), type: 'EVALUATION', codeCampagne: 'POLEEMPLOI123', urlCampagne: 'https://app.pix.fr/campagnes/POLEEMPLOI123', nomOrganisme: 'Pix', typeOrganisme: 'externe' }, individu: { nom: 'Kamado', prenom: 'Tanjiro' }, test: { etat: 2, typeTest: 'DI', referenceExterne: 123456, dateDebut: new Date('2020-09-01'), elementsEvalues: [] } }, isSuccessful: true }, 'externalUserId');
        poleEmploiSendingFactory.buildWithUser({ isSuccessful: false });
        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: '/api/pole-emploi/envois?enErreur=false',
          headers: { authorization: generateValidRequestAuthorizationHeaderForApplication(POLE_EMPLOI_CLIENT_ID, POLE_EMPLOI_SOURCE, POLE_EMPLOI_SCOPE) },
        };

        //when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.headers.link).to.equal('https://url-externe/pole-emploi/envois?curseur=eyJpZEVudm9pIjo3NjM0NSwiZGF0ZUVudm9pIjoiMjAyMS0wNS0wMVQwMDowMDowMC4wMDBaIn0=&enErreur=false');
        expect(response.result).to.deep.equal([{
          'idEnvoi': sending.id,
          'dateEnvoi': new Date('2021-05-01'),
          'resultat': {
            'campagne': {
              'nom': 'Campagne PE',
              'dateDebut': '2020-08-01T00:00:00.000Z',
              'type': 'EVALUATION',
              'codeCampagne': 'POLEEMPLOI123',
              'urlCampagne': 'https://app.pix.fr/campagnes/POLEEMPLOI123',
              'nomOrganisme': 'Pix',
              'typeOrganisme': 'externe' },
            'individu': {
              'nom': 'Kamado',
              'prenom': 'Tanjiro',
              'idPoleEmploi': 'externalUserId' },
            'test': {
              'etat': 2,
              'typeTest': 'DI',
              'referenceExterne': 123456,
              'dateDebut': '2020-09-01T00:00:00.000Z',
              'elementsEvalues': [] } } }]);
      });
    });

    context('When the request has failed', function() {
      it('should return 403 HTTP status code if user is not allowed to access', async function() {
        // given
        options = {
          method: 'GET',
          url: '/api/pole-emploi/envois',
          headers: { authorization: generateValidRequestAuthorizationHeaderForApplication(POLE_EMPLOI_CLIENT_ID, POLE_EMPLOI_SOURCE) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should return 401 HTTP status code if user is not authenticated', async function() {
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
