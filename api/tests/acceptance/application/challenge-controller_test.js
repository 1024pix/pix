const { airtableBuilder, expect, nock } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | API | ChallengeController', () => {

  describe('GET /api/challenges/:challenge_id', () => {

    const proposals = '- Ils sont bio.\n' +
                      '- Ils pèsent plus de 63 grammes.\n' +
                      '- Ce sont des oeufs frais.\n' +
                      '- Ils sont destinés aux consommateurs.\n' +
                      '- Ils ne sont pas lavés.\n';
    const instruction = 'Que peut-on dire des œufs de catégorie A ?\n';
    const challengeId = 'recLt9uwa2dR3IYpi';
    const challengeType = 'QCM';

    before(() => {
      nock.cleanAll();
    });

    beforeEach(() => {

      const airtableChallenge = airtableBuilder.factory.buildChallenge({
        id: challengeId,
        typeDEpreuve: challengeType,
        consigne: instruction,
        propositions: proposals,
        acquix: [],
      });
      airtableBuilder
        .mockRoute({ tableName: 'Epreuves', routeType: airtableBuilder.ROUTE_TYPE.GET })
        .returns(airtableChallenge)
        .activate();
    });

    afterEach(() => {
      airtableBuilder.cleanAll();
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
