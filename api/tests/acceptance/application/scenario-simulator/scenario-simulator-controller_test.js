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

// eslint-disable-next-line mocha/no-skipped-tests
describe.skip('Acceptance | Controller | scenario-simulator-controller', function () {
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
        { id: 'challenge1', skillId: 'skill1', status: 'validé', alpha: 0.16, delta: -2, locales: ['fr-fr'] },
        { id: 'challenge2', skillId: 'skill2', status: 'validé', alpha: 3, delta: 6, locales: ['fr-fr'] },
        { id: 'challenge3', skillId: 'skill3', status: 'validé', alpha: 1.587, delta: 8.5, locales: ['fr-fr'] },
        { id: 'challenge4', skillId: 'skill4', status: 'validé', alpha: 2.86789, delta: 0.145, locales: ['fr-fr'] },
        { id: 'challenge5', skillId: 'skill5', status: 'validé', alpha: 3, delta: 1, locales: ['fr-fr'] },
        { id: 'challenge6', skillId: 'skill5', status: 'validé', alpha: 1.7, delta: -1, locales: ['fr-fr'] },
      ],
    };

    mockLearningContent(learningContent);
  });

  describe('#simulateFlashDeterministicAssessmentScenario', function () {
    let options;

    beforeEach(async function () {
      options = {
        method: 'POST',
        url: `/api/scenario-simulator`,
        payload: {},
        headers: {},
      };
    });

    it('should return a payload with simulation deterministic scenario results', async function () {
      // given
      const assessmentId = '1234';
      const simulationAnswers = ['ok', 'ko', 'aband'];
      options.headers.authorization = adminAuthorization;
      options.payload = {
        assessmentId,
        simulationAnswers,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response).to.have.property('statusCode', 200);
      expect(response.result).to.have.property('challenges');
      expect(response.result).to.have.property('estimatedLevel');
      expect(response.result.challenges).to.deep.equal([]);
    });

    // describe('when there is no connected user', function () {
    //   it('should return status code 401', async function () {
    //     // given
    //     options.headers.authorization = undefined;
    //
    //     // when
    //     const response = await server.inject(options);
    //
    //     // then
    //     expect(response).to.have.property('statusCode', 401);
    //   });
    // });
    //
    // describe('when connected user does not have role SUPER_ADMIN', function () {
    //   it('should return status code 403', async function () {
    //     // given
    //     const { id: userId } = databaseBuilder.factory.buildUser();
    //     options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
    //     await databaseBuilder.commit();
    //     options.payload = {
    //       dataset: {
    //         simulations: [
    //           {
    //             estimatedLevel: 1,
    //           },
    //         ],
    //       },
    //     };
    //
    //     // when
    //     const response = await server.inject(options);
    //
    //     // then
    //     expect(response).to.have.property('statusCode', 403);
    //   });
    // });
    //
    // describe('when request payload is invalid', function () {
    //   it('should return status code 400', async function () {
    //     // given
    //     options.headers.authorization = adminAuthorization;
    //     options.payload = {
    //       wrongField: [
    //         {
    //           simulations: [],
    //         },
    //       ],
    //     };
    //
    //     // when
    //     const response = await server.inject(options);
    //
    //     // then
    //     expect(response).to.have.property('statusCode', 400);
    //   });
    // });
  });
});
