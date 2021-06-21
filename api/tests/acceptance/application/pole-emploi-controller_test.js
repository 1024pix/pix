const {
  expect,
  knex,
  databaseBuilder,
  generateValidRequestAuthorizationHeaderForApplication,
} = require('../../test-helper');
const createServer = require('../../../server');
const authenticationCache = require('../../../lib/infrastructure/caches/authentication-cache');
const jsonwebtoken = require('jsonwebtoken');

describe('Acceptance | API | Pole Emploi Controller', () => {

  let server, request, options;

  const POLE_EMPLOI_CLIENT_ID = 'poleEmploiClientId';
  const POLE_EMPLOI_SCOPE = 'pole-emploi-participants-result';
  const POLE_EMPLOI_SOURCE = 'poleEmploi';

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/pole-emplois/users', () => {

    const userAuthenticationKey = 'userAuthenticationKey';

    const firstName = 'firstName';
    const lastName = 'lastName';
    const externalIdentifier = 'idIdentiteExterne';

    beforeEach(() => {
      const idToken = jsonwebtoken.sign({
        'given_name': firstName,
        'family_name': lastName,
        nonce: 'nonce',
        idIdentiteExterne: externalIdentifier,
      }, 'secret');

      const userCredentials = {
        accessToken: 'accessToken',
        idToken,
        expiresIn: 10,
        refreshToken: 'refreshToken',
      };
      authenticationCache.set(userAuthenticationKey, userCredentials);

      request = {
        method: 'POST',
        url: `/api/pole-emplois/users?authentication-key=${userAuthenticationKey}`,
      };
    });

    afterEach(async () => {
      await knex('authentication-methods').delete();
      await knex('users').delete();
    });

    it('should return 200 HTTP status', async () => {
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

  describe('GET /api/pole-emploi/envois', () => {

    it('should return 200 HTTP status code', async () => {
      const organizationId = databaseBuilder.factory.buildOrganization({ name: 'Pole emploi' }).id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;

      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod({ userId, identityProvider: 'POLE_EMPLOI', externalIdentifier: 'externalUserId' });
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId }).id;
      const sending = databaseBuilder.factory.buildPoleEmploiSending({ campaignParticipationId, createdAt: new Date('2021-05-01'), payload: { campagne: { nom: 'Campagne PE', dateDebut: new Date('2020-08-01'), type: 'EVALUATION', codeCampagne: 'POLEEMPLOI123', urlCampagne: 'https://app.pix.fr/campagnes/POLEEMPLOI123', nomOrganisme: 'Pix', typeOrganisme: 'externe' }, individu: { nom: 'Kamado', prenom: 'Tanjiro' }, test: { etat: 2, typeTest: 'DI', referenceExterne: 123456, dateDebut: new Date('2020-09-01'), elementsEvalues: [] } } });
      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: '/api/pole-emploi/envois',
        headers: { authorization: generateValidRequestAuthorizationHeaderForApplication(POLE_EMPLOI_CLIENT_ID, POLE_EMPLOI_SOURCE, POLE_EMPLOI_SCOPE) },
      };
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal([{
        'idEnvoi': `${sending.id}`,
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

    it('should return 401 HTTP status code if user is not authenticated', async () => {

      // given
      const options = {
        method: 'GET',
        url: '/api/pole-emploi/envois',
        headers: { authorization: generateValidRequestAuthorizationHeaderForApplication('fake-client-id', 'fake-source', 'fake-scope') },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(401);
    });
  });
});
