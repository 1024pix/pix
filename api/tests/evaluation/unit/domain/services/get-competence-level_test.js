import sinon from 'sinon';

import { getCompetenceLevel } from '../../../../../src/evaluation/domain/services/get-competence-level.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Service | Get Competence Level', function () {
  describe('#getCompetenceLevel', function () {
    const userId = 'userId';
    const level = 3;
    const competenceId = 'competenceId';

    it('reads the level from the competence score balance when it exists', async function () {
      // given
      const competenceScoreRepository = {
        findByUserId: sinon.stub().resolves(new Map([[competenceId, 25.3]])),
      };
      const knowledgeStateRepository = { findByUserId: sinon.stub() };
      const scoringService = {
        calculateScoringInformationFromPix: sinon.stub().returns({ currentLevel: level }),
      };

      // when
      const competenceLevel = await getCompetenceLevel({
        userId,
        competenceId,
        dependencies: { knowledgeStateRepository, competenceScoreRepository, scoringService },
      });

      // then: the balance is enough, the position is not read back
      expect(competenceLevel).to.equal(level);
      expect(scoringService.calculateScoringInformationFromPix).to.be.calledWith({ exactlyEarnedPix: 25.3 });
      expect(knowledgeStateRepository.findByUserId).to.not.have.been.called;
    });

    it('falls back to the projected position when the competence has no balance', async function () {
      // given
      const competenceScoreRepository = { findByUserId: sinon.stub().resolves(new Map()) };
      const knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
        validatedSkillIds: ['skillA'],
        invalidatedSkillIds: ['skillB'],
        competenceId,
      });
      const knowledgeStateRepository = { findByUserId: sinon.stub().resolves(knowledgeState) };
      const scoringService = {
        calculateScoringInformationForCompetence: sinon.stub().returns({ currentLevel: level }),
      };

      // when
      const competenceLevel = await getCompetenceLevel({
        userId,
        competenceId,
        dependencies: { knowledgeStateRepository, competenceScoreRepository, scoringService },
      });

      // then
      expect(competenceLevel).to.equal(level);
      expect(knowledgeStateRepository.findByUserId).to.be.calledWith({ userId });
      const { validatedSkills } = scoringService.calculateScoringInformationForCompetence.firstCall.args[0];
      expect(validatedSkills.map(({ id }) => id)).to.deep.equal(['skillA']);
    });
  });
});
