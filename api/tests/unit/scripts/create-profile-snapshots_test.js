const { expect, domainBuilder, sinon } = require('../../test-helper');
const { createProfileSnapshot } = require('../../../scripts/create-profile-snapshots');

describe('create profile snapshots', () => {
  describe('#createProfileSnapshot', () => {
    it('returns a json with pixScore and score cards', () => {
      // given
      const competences = [domainBuilder.buildCompetence({ id: 'recCompetencePix' })];

      const knowledgeElements = [
        domainBuilder.buildKnowledgeElement({ competenceId: 'recCompetencePix' }),
        domainBuilder.buildKnowledgeElement({ competenceId: 'recCompetencePix' }),
      ];

      const userId = 'userid';

      const scoringService = {
        calculateScoringInformationForCompetence: sinon.stub().returns({
          realTotalPixScoreForCompetence: 4,
          pixScoreForCompetence: 9,
          currentLevel: 5,
          pixAheadForNextLevel: 3,
        }),
      };

      // when
      const profileJson = createProfileSnapshot({ userId, knowledgeElements, competences, scoringService });

      // then
      expect(profileJson.pixScore).to.equal(9);
      expect(profileJson.scorecards).to.deep.equal([{
        id: 'userid_recCompetencePix',
        competenceId: 'recCompetencePix',
        earnedPix: 9,
      }]);
    });
  });
});
