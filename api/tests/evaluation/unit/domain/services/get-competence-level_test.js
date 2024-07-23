import { getCompetenceLevel } from '../../../../../src/evaluation/domain/services/get-competence-level.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Domain | Service | Get Competence Level', function () {
  describe('#getCompetenceLevel', function () {
    const userId = 'userId';
    const level = 3;
    let competenceLevel;
    let knowledgeElementRepository;
    let competenceId;
    let knowledgeElements;
    let scoringService;

    beforeEach(async function () {
      // given
      competenceId = 'competenceId';
      knowledgeElements = Symbol('knowledgeElements');
      knowledgeElementRepository = {
        findUniqByUserIdAndCompetenceId: sinon.stub().resolves(knowledgeElements),
      };
      scoringService = {
        calculateScoringInformationForCompetence: sinon.stub().returns({ currentLevel: level }),
      };

      // when
      competenceLevel = await getCompetenceLevel({
        userId,
        competenceId,
        dependencies: {
          knowledgeElementRepository,
          scoringService,
        },
      });
    });

    it('should retrieve knowledgeElements for competence and user', function () {
      // then
      expect(knowledgeElementRepository.findUniqByUserIdAndCompetenceId).to.be.calledWith({
        userId,
        competenceId,
      });
    });

    it('should use scoringService to compute competence level', function () {
      // then
      expect(scoringService.calculateScoringInformationForCompetence).to.be.calledWith({ knowledgeElements });
    });

    it('should return competence level', function () {
      // then
      expect(competenceLevel).to.equal(level);
    });
  });
});
