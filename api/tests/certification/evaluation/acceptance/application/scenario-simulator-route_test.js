import { createServer } from '../../../../../server.js';
import { PIX_ADMIN } from '../../../../../src/shared/constants.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';
import { parseNDJSON } from '../../../../tooling/test-utils/json.js';

const {
  ROLES: { SUPER_ADMIN },
} = PIX_ADMIN;

describe('Acceptance | Controller | scenario-simulator-controller', function () {
  let server;
  let adminAuthorizationHeaders;
  let validPayload;

  beforeEach(async function () {
    const { id: adminId } = databaseBuilder.factory.buildUser.withRole({
      role: SUPER_ADMIN,
    });

    const version = databaseBuilder.factory.buildCertificationVersion({
      challengesConfiguration: {
        maximumAssessmentLength: 2,
        challengesBetweenSameCompetence: 2,
        limitToOneQuestionPerTube: false,
        enablePassageByAllCompetences: false,
        variationPercent: 0.5,
        defaultCandidateCapacity: -3,
        defaultProbabilityToPickChallenge: 51,
      },
    });

    adminAuthorizationHeaders = generateAuthenticatedUserRequestHeaders({ userId: adminId });

    validPayload = {
      capacity: 4.5,
      locale: 'fr-fr',
      versionId: version.id,
    };

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
        {
          id: 'challenge1',
          skillId: 'skill1',
          status: 'validé',
          alpha: 0.16,
          delta: -2,
          locales: ['fr-fr'],
          successProbabilityThreshold: 0.3,
          accessibility1: 'RAS',
          accessibility2: 'KO',
        },
        {
          id: 'challenge2',
          skillId: 'skill2',
          status: 'validé',
          alpha: 3,
          delta: 6,
          locales: ['fr-fr'],
          successProbabilityThreshold: 0.4,
          accessibility1: 'KO',
          accessibility2: 'RAS',
        },
        {
          id: 'challenge3',
          skillId: 'skill3',
          status: 'validé',
          alpha: 1.587,
          delta: 8.5,
          locales: ['fr-fr'],
          successProbabilityThreshold: 0.5,
          accessibility1: 'RAS',
          accessibility2: 'OK',
        },
        {
          id: 'challenge4',
          skillId: 'skill4',
          status: 'validé',
          alpha: 2.86789,
          delta: 0.145,
          locales: ['fr-fr'],
          successProbabilityThreshold: 0.6,
          accessibility1: 'OK',
          accessibility2: 'OK',
        },
        {
          id: 'challenge5',
          skillId: 'skill5',
          status: 'validé',
          alpha: 3,
          delta: 1,
          locales: ['fr-fr'],
          successProbabilityThreshold: 0.7,
          accessibility1: 'RAS',
          accessibility2: 'RAS',
        },
        {
          id: 'challenge6',
          skillId: 'skill5',
          status: 'validé',
          alpha: 1.7,
          delta: -1,
          locales: ['fr-fr'],
          successProbabilityThreshold: 0.8,
          accessibility1: 'OK',
          accessibility2: 'RAS',
        },
      ],
    };

    databaseBuilder.factory.buildCertificationFrameworksChallenge({
      challengeId: 'challenge1',
      versionId: version.id,
    });

    databaseBuilder.factory.buildCertificationFrameworksChallenge({
      challengeId: 'challenge2',
      versionId: version.id,
    });

    databaseBuilder.factory.buildCertificationFrameworksChallenge({
      challengeId: 'challenge3',
      versionId: version.id,
    });

    databaseBuilder.factory.buildCertificationFrameworksChallenge({
      challengeId: 'challenge4',
      versionId: version.id,
    });

    databaseBuilder.factory.buildCertificationFrameworksChallenge({
      challengeId: 'challenge5',
      versionId: version.id,
    });

    databaseBuilder.factory.buildCertificationFrameworksChallenge({
      challengeId: 'challenge6',
      versionId: version.id,
    });

    databaseBuilder.factory.learningContent.build(learningContent);
    await databaseBuilder.commit();

    server = await createServer();
  });

  describe('#simulateFlashAssessmentScenario', function () {
    let options;

    beforeEach(async function () {
      options = {
        method: 'POST',
        url: `/api/scenario-simulator`,
        payload: {},
        headers: {},
      };
    });

    it('should return a report with the same number of simulation scenario reports as the number of challenges in the configuration', async function () {
      // given
      options.headers = adminAuthorizationHeaders;
      options.payload = validPayload;

      // when
      const response = await server.inject(options);

      // then
      expect(response).to.have.property('statusCode', 200);
      const parsedResponse = parseNDJSON(response.result);
      expect(parsedResponse[0].simulationReport).to.have.lengthOf(2);
      expect(parsedResponse[0].simulationReport[0].challengeId).to.exist;
      expect(parsedResponse[0].simulationReport[0].capacity).to.exist;
      expect(parsedResponse[0].simulationReport[0].difficulty).to.exist;
      expect(parsedResponse[0].simulationReport[0].discriminant).to.exist;
      expect(parsedResponse[0].simulationReport[0].reward).to.exist;
      expect(parsedResponse[0].simulationReport[0].errorRate).to.exist;
      expect(parsedResponse[0].simulationReport[0].answerStatus).to.exist;
      expect(parsedResponse[0].simulationReport[0].numberOfAvailableChallenges).to.exist;
    });

    describe('when the stopAtChallenge parameter is given', function () {
      it('should return a report that contains the targeted number of challenges', async function () {
        // given
        options.headers = adminAuthorizationHeaders;
        options.payload = {
          ...validPayload,
          stopAtChallenge: 1,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response).to.have.property('statusCode', 200);
        const parsedResponse = parseNDJSON(response.result);
        expect(parsedResponse[0].simulationReport).to.have.lengthOf(1);
      });
    });

    describe('when the accessibilityAdjustmentNeeded parameter is given', function () {
      it('should return a report that contains the targeted number of challenges', async function () {
        // given
        options.headers = adminAuthorizationHeaders;
        options.payload = {
          ...validPayload,
          accessibilityAdjustmentNeeded: true,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response).to.have.property('statusCode', 200);
        const parsedResponse = parseNDJSON(response.result);
        expect(parsedResponse[0].simulationReport).to.have.lengthOf(2);
        expect(['challenge3', 'challenge4', 'challenge5', 'challenge6']).to.include(
          parsedResponse[0].simulationReport[0].challengeId,
        );
        expect(['challenge3', 'challenge4', 'challenge5', 'challenge6']).to.include(
          parsedResponse[0].simulationReport[1].challengeId,
        );
      });
    });

    describe('when there is no connected user', function () {
      it('should return status code 401', async function () {
        // given
        options.headers = {};

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
        options.headers = generateAuthenticatedUserRequestHeaders({ userId });
        await databaseBuilder.commit();
        options.payload = validPayload;

        // when
        const response = await server.inject(options);

        // then
        expect(response).to.have.property('statusCode', 403);
      });
    });

    describe('when request payload is invalid', function () {
      it('should return status code 400', async function () {
        // given
        options.headers = adminAuthorizationHeaders;
        options.payload = {
          wrongField: [],
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response).to.have.property('statusCode', 400);
      });
    });
  });
});
