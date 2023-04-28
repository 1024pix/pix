const { expect, sinon } = require('../../../test-helper');
const getCompetenceLevel = require('../../../../lib/domain/services/get-competence-level');

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
    let knowledgeElementRepository;
    let scoringService;

    beforeEach(async function () {
      // given
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
        domainTransaction,
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
