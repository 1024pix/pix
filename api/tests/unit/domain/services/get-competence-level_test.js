import { expect, sinon } from '../../../test-helper';
import getCompetenceLevel from '../../../../lib/domain/services/get-competence-level';
import knowledgeElementRepository from '../../../../lib/infrastructure/repositories/knowledge-element-repository';
import scoringService from '../../../../lib/domain/services/scoring/scoring-service';

describe('Unit | Domain | Service | Get Competence Level', function () {
  describe('#getCompetenceLevel', function () {
    const userId = 'userId';
    const competenceId = 'competenceId';
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const knowledgeElements = Symbol('knowledgeElements');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const domainTransaction = Symbol('domainTransaction');
    const level = 3;
    let competenceLevel;

    beforeEach(async function () {
      // given
      sinon.stub(knowledgeElementRepository, 'findUniqByUserIdAndCompetenceId').resolves(knowledgeElements);
      sinon.stub(scoringService, 'calculateScoringInformationForCompetence').returns({ currentLevel: level });

      // when
      competenceLevel = await getCompetenceLevel({
        knowledgeElementRepository,
        scoringService,
        userId,
        competenceId,
        domainTransaction,
      });
    });

    it('should retrieve knowledgeElements for competence and user', function () {
      // then
      expect(knowledgeElementRepository.findUniqByUserIdAndCompetenceId).to.be.calledWith({
        userId,
        competenceId,
        domainTransaction,
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
