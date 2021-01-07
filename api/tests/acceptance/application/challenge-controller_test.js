const { learningContentBuilder, expect, mockLearningContent } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | API | ChallengeController', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/challenges/:challenge_id', () => {

    const proposals = '- Ils sont bio.\n' +
                      '- Ils pèsent plus de 63 grammes.\n' +
                      '- Ce sont des oeufs frais.\n' +
                      '- Ils sont destinés aux consommateurs.\n' +
                      '- Ils ne sont pas lavés.\n';
    const instruction = 'Que peut-on dire des œufs de catégorie A ?\n';
    const challengeId = 'recLt9uwa2dR3IYpi';
    const challengeType = 'QCM';

    beforeEach(() => {
      const learningContent = [{
        id: 'recArea0',
        competences: [{
          id: 'recCompetence',
          titreFrFr: 'Mener une recherche et une veille d’information',
          index: '1.1',
          tubes: [{
            id: 'recTube0_0',
            skills: [{
              id: 'skillWeb1',
              nom: '@skillWeb1',
              challenges: [{
                id: challengeId,
                type: challengeType,
                instruction,
                proposals,
              }],
            }],
          }],
        }],
      }];
      const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
      mockLearningContent(learningContentObjects);
    });

    const options = {
      method: 'GET',
      url: `/api/challenges/${challengeId}`,
    };

    it('should return 200 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should return application/json', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });
    });

    it('should return the expected challenge', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const challenge = response.result.data;
        expect(challenge.id).to.equal(challengeId);
        expect(challenge.attributes.instruction).to.equal(instruction);
        expect(challenge.attributes.proposals).to.equal(proposals);
        expect(challenge.attributes.type).to.equal(challengeType);
      });
    });
  });
});
