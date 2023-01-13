const { expect } = require('chai');
const createServer = require('../../../../server');
const {
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  mockLearningContent,
} = require('../../../test-helper');
const {
  ROLES: { SUPER_ADMIN },
} = require('../../../../lib/domain/constants').PIX_ADMIN;

describe('Acceptance | Controller | scoring-simulator-controller', function () {
  let server;
  let adminAuthorization;

  beforeEach(async function () {
    server = await createServer();

    const { id: adminId } = databaseBuilder.factory.buildUser.withRole({
      role: SUPER_ADMIN,
    });
    adminAuthorization = generateValidRequestAuthorizationHeader(adminId);
    await databaseBuilder.commit();

    const learningContent = {
      competences: [
        {
          id: 'rec1',
          name_i18n: {
            fr: 'comp1Fr',
            en: 'comp1En',
          },
          index: '1.1',
          color: 'rec1Color',
          skillIds: ['skill1', 'skill2'],
        },
        {
          id: 'rec2',
          name_i18n: {
            fr: 'comp2Fr',
            en: 'comp2En',
          },
          index: '2.1',
          color: 'rec2Color',
          skillIds: ['skill3', 'skill4', 'skill5'],
        },
      ],
      tubes: [
        { id: 'recTube1', competenceId: 'rec1' },
        { id: 'recTube2', competenceId: 'rec2' },
      ],
      skills: [
        // tube 1
        { id: 'skill1', status: 'actif', tubeId: 'recTube1', competenceId: 'rec1', level: 1, pixValue: 1 },
        { id: 'skill2', status: 'actif', tubeId: 'recTube1', competenceId: 'rec1', level: 3, pixValue: 10 },
        // tube 2
        { id: 'skill3', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2', level: 2, pixValue: 100 },
        { id: 'skill4', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2', level: 3, pixValue: 1000 },
        { id: 'skill5', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2', level: 5, pixValue: 10000 },
        { id: 'skill6', status: 'périmé', tubeId: 'recTube2', competenceId: 'rec2', level: 6, pixValue: 100000 },
      ],
      challenges: [
        { id: 'challenge1', skillId: 'skill1', status: 'validé' },
        { id: 'challenge2', skillId: 'skill2', status: 'validé' },
        { id: 'challenge3', skillId: 'skill3', status: 'validé' },
        { id: 'challenge4', skillId: 'skill4', status: 'validé' },
        { id: 'challenge5', skillId: 'skill5', status: 'validé' },
        { id: 'challenge6', skillId: 'skill5', status: 'validé' },
      ],
    };

    mockLearningContent(learningContent);
  });

  describe('#calculateOldScores', function () {
    let options;

    beforeEach(async function () {
      options = {
        method: 'POST',
        url: `/api/scoring-simulator/old`,
        payload: {},
        headers: {},
      };
    });

    it('should return a payload with simulation results', async function () {
      // given
      options.headers.authorization = adminAuthorization;
      options.payload = {
        simulations: [
          {
            answers: [
              { challengeId: 'challenge3', result: 'ok' },
              { challengeId: 'challenge2', result: 'ok' },
              { challengeId: 'challenge5', result: 'ok' },
            ],
          },
          {
            id: 'simulationWithError',
            answers: [
              { challengeId: 'challenge2', result: 'ok' },
              { challengeId: 'challenge1', result: 'ok' },
            ],
          },
        ],
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response).to.have.property('statusCode', 200);
      expect(response.result).to.deep.equal({
        results: [
          {
            id: undefined,
            error: undefined,
            pixScore: 11111,
          },
          {
            id: 'simulationWithError',
            error: 'Answer for skill skill1 was already given or inferred',
            pixScore: undefined,
          },
        ],
      });
    });

    describe('when there is no connected user', function () {
      it('should return status code 401', async function () {
        // given
        options.headers.authorization = undefined;

        // when
        const response = await server.inject(options);

        // then
        expect(response).to.have.property('statusCode', 401);
      });
    });

    describe('when connected user does not have role SUPER_ADMIN', function () {
      it('should return status code 403', async function () {
        // given
        const { id: userId } = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
        options.payload = {
          simulations: [{ answers: [{ challengeId: 'test', result: 'ok' }] }],
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response).to.have.property('statusCode', 403);
      });
    });

    describe('when request payload is invalid', function () {
      it('should return status code 400', async function () {
        // given
        options.headers.authorization = adminAuthorization;
        options.payload = {
          wrongField: [
            {
              answers: [],
            },
          ],
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response).to.have.property('statusCode', 400);
      });
    });
  });

  describe('#calculateFlashScores', function () {
    let options;

    beforeEach(async function () {
      options = {
        method: 'POST',
        url: `/api/scoring-simulator/flash`,
        payload: {},
        headers: {},
      };
    });

    it('should return status code 200', async function () {
      // given
      options.headers.authorization = adminAuthorization;

      // when
      const response = await server.inject(options);

      // then
      expect(response).to.have.property('statusCode', 200);
    });

    describe('when there is no connected user', function () {
      it('should return status code 401', async function () {
        // given
        options.headers.authorization = undefined;

        // when
        const response = await server.inject(options);

        // then
        expect(response).to.have.property('statusCode', 401);
      });
    });

    describe('when connected user does not have role SUPER_ADMIN', function () {
      it('should return status code 403', async function () {
        // given
        const { id: userId } = databaseBuilder.factory.buildUser();
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response).to.have.property('statusCode', 403);
      });
    });
  });
});
