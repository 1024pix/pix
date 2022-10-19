const {
  expect,
  generateValidRequestAuthorizationHeader,
  databaseBuilder,
  LearningContentMock,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const { FRENCH_FRANCE } = require('../../../../lib/domain/constants').LOCALE;

describe('Acceptance | Controller | answer-controller-get-correction', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    LearningContentMock.mockCommon();
  });

  describe('GET /api/answers/{id}/correction', function () {
    let assessment = null;
    let answer = null;
    let userId;
    const challengeId = 'challengePixA1C1Th1Tu1S2Ch1';
    const tutorialId = 'tutorialPixA1C1Th1Tu1S2Tuto1FR';
    const skillId = 'skillPixA1C1Th1Tu1S2';

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser({ id: 111 }).id;
      assessment = databaseBuilder.factory.buildAssessment({
        state: 'completed',
        userId,
      });

      answer = databaseBuilder.factory.buildAnswer({
        value: 'any good answer',
        result: 'ok',
        challengeId,
        assessmentId: assessment.id,
      });

      databaseBuilder.factory.buildUserSavedTutorial({
        id: 10001,
        userId,
        tutorialId,
      });

      databaseBuilder.factory.buildTutorialEvaluation({
        id: 10002,
        userId,
        tutorialId,
      });

      await databaseBuilder.commit();
    });

    context('when Accept-Language header is specified', function () {
      it('should return the answer correction with tutorials restricted to given language', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/answers/${answer.id}/correction`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
            'accept-language': FRENCH_FRANCE,
          },
        };

        const challengeData = LearningContentMock.getChallengeDTO(challengeId);
        const tutorialData = LearningContentMock.getTutorialDTO(tutorialId);
        const expectedBody = {
          data: {
            id: challengeId,
            type: 'corrections',
            attributes: {
              solution: challengeData.solution,
              'solution-to-display': challengeData.solutionToDisplay,
              hint: LearningContentMock.getSkillDTO(skillId).hintFr,
            },
            relationships: {
              tutorials: {
                data: [
                  {
                    id: tutorialId,
                    type: 'tutorials',
                  },
                ],
              },
              'learning-more-tutorials': {
                data: [],
              },
            },
          },
          included: [
            {
              attributes: {
                id: 10002,
                status: 'LIKED',
                'tutorial-id': tutorialId,
                'user-id': 111,
              },
              id: '10002',
              type: 'tutorial-evaluation',
            },
            {
              attributes: {
                id: 10001,
                'tutorial-id': tutorialId,
                'user-id': 111,
              },
              id: '10001',
              type: 'user-saved-tutorial',
            },
            {
              attributes: {
                duration: tutorialData.duration,
                format: tutorialData.format,
                id: tutorialId,
                link: tutorialData.link,
                'skill-id': skillId,
                source: tutorialData.source,
                title: tutorialData.title,
              },
              id: tutorialId,
              type: 'tutorials',
              relationships: {
                'user-saved-tutorial': {
                  data: {
                    id: '10001',
                    type: 'user-saved-tutorial',
                  },
                },
                'tutorial-evaluation': {
                  data: {
                    id: '10002',
                    type: 'tutorial-evaluation',
                  },
                },
              },
            },
          ],
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedBody);
      });
    });

    it('should return 404 when user does not have access to this answer', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/answers/${answer.id}/correction`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId + 3) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return 404 when the answer id provided is not an integer', async function () {
      // given
      const options = {
        method: 'GET',
        url: '/api/answers/1/correction',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });
  });
});
