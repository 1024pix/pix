const { expect, sinon } = require('../../../test-helper');
const getCompetenceLevel = require('../../../../lib/domain/services/get-competence-level');
const knowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');
const scoringService = require('../../../../lib/domain/services/scoring/scoring-service');

describe('Unit | Domain | Service | Get Competence Level', function() {

  describe('#getCompetenceLevel', () => {
    const userId = 'userId';
    const competenceId = 'competenceId';
    const knowledgeElements = Symbol('knowledgeElements');
    const domainTransaction = Symbol('domainTransaction');
    const level = 3;
    let competenceLevel;

    beforeEach(async () => {
      // given
      sinon.stub(knowledgeElementRepository, 'findUniqByUserIdAndCompetenceId').resolves(knowledgeElements);
      sinon.stub(scoringService, 'calculateScoringInformationForCompetence').returns({ currentLevel: level });

      // when
      competenceLevel = await getCompetenceLevel({ knowledgeElementRepository, scoringService, userId, competenceId, domainTransaction });
    });

    it('should retrieve knowledgeElements for competence and user', () => {
      // then
      expect(knowledgeElementRepository.findUniqByUserIdAndCompetenceId).to.be.calledWith({ userId, competenceId, domainTransaction });
    });

    it('should use scoringService to compute competence level', () => {
      // then
      expect(scoringService.calculateScoringInformationForCompetence).to.be.calledWith({ knowledgeElements });
    });

    it('should return competence level', () => {
      // then
      expect(competenceLevel).to.equal(level);
    });
  });
});

