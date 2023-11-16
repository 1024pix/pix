import chai from 'chai';

const { expect } = chai;

import { createServer } from '../../../../server.js';

import { databaseBuilder, generateValidRequestAuthorizationHeader, mockLearningContent } from '../../../test-helper.js';

import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';

const { ROLES } = PIX_ADMIN;

const isoDateFormat = /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d\d\d.*$/;

describe('Acceptance | Controller | scoring-simulator-controller', function () {
  let server;
  let adminAuthorization;

  beforeEach(async function () {
    server = await createServer();

    const { id: adminId } = databaseBuilder.factory.buildUser.withRole({
      role: ROLES.SUPER_ADMIN,
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
        dataset: {
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
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response).to.have.property('statusCode', 200);
      expect(response.result.results).to.exactlyContain([
        {
          id: undefined,
          estimatedLevel: undefined,
          pixScore: 11111,
          error: undefined,
          pixScoreByCompetence: [
            {
              competenceId: 'rec1',
              pixScore: 11,
            },
            {
              competenceId: 'rec2',
              pixScore: 11100,
            },
          ],
        },
        {
          id: 'simulationWithError',
          estimatedLevel: undefined,
          pixScore: undefined,
          pixScoreByCompetence: [],
          error: 'Answer for skill skill1 was already given or inferred',
        },
      ]);
      expect(response.result.date).to.match(isoDateFormat);
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
          dataset: {
            simulations: [{ answers: [{ challengeId: 'test', result: 'ok' }] }],
          },
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
              simulations: [],
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

    it('should return a payload with simulation results', async function () {
      // given
      options.headers.authorization = adminAuthorization;
      options.payload = {
        context: {
          id: 'superContext',
        },
        dataset: {
          id: 'awesomeDataset',
          simulations: [
            {
              id: 'simulation1',
              user: {
                id: '101',
                estimatedLevel: 2.5769829347,
              },
              answers: [
                {
                  challengeId: 'challenge3',
                  result: 'ok',
                },
                {
                  challengeId: 'challenge2',
                  result: 'ok',
                },
                {
                  challengeId: 'challenge5',
                  result: 'ok',
                },
              ],
            },
            {
              id: 'simulation2',
              answers: [
                {
                  challengeId: 'challenge2',
                  result: 'ok',
                },
                {
                  challengeId: 'challenge1',
                  result: 'ok',
                },
              ],
            },
          ],
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response).to.have.property('statusCode', 200);
      expect(response.result).to.have.property('contextId', 'superContext');
      expect(response.result).to.have.property('datasetId', 'awesomeDataset');
      expect(response.result.results).to.exactlyContain([
        {
          id: 'simulation1',
          estimatedLevel: 2.5769829347,
          pixScore: 11110,
          pixScoreByCompetence: [
            { competenceId: 'rec1', pixScore: 10 },
            { competenceId: 'rec2', pixScore: 11100 },
          ],
          error: undefined,
        },
        {
          id: 'simulation2',
          error: 'Simulation should have an estimated level',
          estimatedLevel: undefined,
          pixScore: undefined,
          pixScoreByCompetence: [],
        },
      ]);
      expect(response.result.date).to.match(isoDateFormat);
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
        options.payload = {
          dataset: {
            simulations: [
              {
                estimatedLevel: 1,
              },
            ],
          },
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
              simulations: [],
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
});
