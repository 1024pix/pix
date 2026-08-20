import sinon from 'sinon';

import { getCompetenceLevel } from '../../../../../src/evaluation/domain/services/get-competence-level.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Service | Get Competence Level', function () {
  describe('#getCompetenceLevel', function () {
    const userId = 'userId';
    const level = 3;
    let competenceLevel;
    let knowledgeStateRepository;
    let competenceId;
    let knowledgeState;
    let scoringService;

    beforeEach(async function () {
      // given
      competenceId = 'competenceId';
      knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
        validatedSkillIds: ['skillA'],
        invalidatedSkillIds: ['skillB'],
        competenceId,
      });
      knowledgeStateRepository = {
        findByUserId: sinon.stub().resolves(knowledgeState),
      };
      scoringService = {
        calculateScoringInformationForCompetence: sinon.stub().returns({ currentLevel: level }),
      };

      // when
      competenceLevel = await getCompetenceLevel({
        userId,
        competenceId,
        dependencies: {
          knowledgeStateRepository,
          scoringService,
        },
      });
    });

    it('should retrieve the knowledge state of the user', function () {
      // then
      expect(knowledgeStateRepository.findByUserId).to.be.calledWith({ userId });
    });

    it('should use scoringService on the validated skills of the competence', function () {
      // then
      const { validatedSkills } = scoringService.calculateScoringInformationForCompetence.firstCall.args[0];
      expect(validatedSkills.map(({ id }) => id)).to.deep.equal(['skillA']);
    });

    it('should return competence level', function () {
      // then
      expect(competenceLevel).to.equal(level);
    });
  });
});
