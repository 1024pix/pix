import { Progression } from '../../../../../src/evaluation/domain/models/Progression.js';
import { expect, domainBuilder } from '../../../../test-helper.js';

describe('Unit | Domain | Models | Progression', function () {
  let skillLevel1, skillLevel2, skillLevel3;
  beforeEach(function () {
    [skillLevel1, skillLevel2, skillLevel3] = domainBuilder.buildSkillCollection();
  });

  describe('#completionRate', function () {
    context('when the profile is not fully evaluated', function () {
      context('and there is no knowledge elements', function () {
        it('should return a completionRate of 0', function () {
          // Given
          const skillIds = [skillLevel1.id, skillLevel2.id, skillLevel3.id];
          const knowledgeElements = [];

          // When
          const progression = new Progression({ skillIds, knowledgeElements, isProfileCompleted: false });

          // Then
          expect(progression.completionRate).to.eq(0);
        });
      });

      context('and knowledge elements are present', function () {
        it('should return 1 when all targeted skills are evaluated', function () {
          // Given
          const skillIds = [skillLevel1.id, skillLevel2.id];
          const knowledgeElements = [
            domainBuilder.buildKnowledgeElement({ skillId: skillLevel1.id }),
            domainBuilder.buildKnowledgeElement({ skillId: skillLevel2.id }),
          ];

          // When
          const progression = new Progression({ skillIds, knowledgeElements, isProfileCompleted: false });

          // Then
          expect(progression.completionRate).to.eq(1);
        });

        it('should return a ratio different than 1 when some targeted skills are not evaluated', function () {
          // Given
          const skillIds = [skillLevel1.id, skillLevel2.id, skillLevel3.id];
          const knowledgeElements = [
            domainBuilder.buildKnowledgeElement({ skillId: skillLevel1.id }),
            domainBuilder.buildKnowledgeElement({ skillId: skillLevel2.id }),
          ];

          // When
          const progression = new Progression({ skillIds, knowledgeElements, isProfileCompleted: false });

          // Then
          expect(progression.completionRate).to.eq(0.6666666666666666);
        });
      });

      context('and the profile contains knowledge elements on skills not in the targeted skills ', function () {
        it('should not take them into account and mark the completion at 1 (equal 100%)', function () {
          // Given
          const skillIds = [skillLevel1.id];
          const knowledgeElements = [
            domainBuilder.buildKnowledgeElement({ skillId: skillLevel1.id, status: 'invalidated' }),
            domainBuilder.buildKnowledgeElement({ skillId: skillLevel2.id, status: 'invalidated' }),
          ];

          // When
          const progression = new Progression({ skillIds, knowledgeElements, isProfileCompleted: false });

          // Then
          expect(progression.completionRate).to.eq(1);
        });
      });
    });

    context('when the profile is fully evaluated', function () {
      it('should return the completionRate of 1', function () {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2, skillLevel3];
        const knowledgeElements = [];

        // When
        const progression = new Progression({ targetedSkills, knowledgeElements, isProfileCompleted: true });

        // Then
        expect(progression.completionRate).to.eq(1);
      });
    });
  });

  describe('#generateIdFromAssessmentId', function () {
    it('should return the id prepended with "progression-"', function () {
      // Given
      const assessmentId = 12345;
      const expectedProgressionId = `progression-${assessmentId}`;

      // When
      const progressionId = Progression.generateIdFromAssessmentId(assessmentId);

      // Then
      expect(progressionId).to.equal(expectedProgressionId);
    });
  });

  describe('#getAssessmentIdFromId', function () {
    it('should return the id without the "progression-"', function () {
      // Given
      const expectedAssessmentId = 12345;
      const progressionId = `progression-${expectedAssessmentId}`;

      // When
      const assessmentId = Progression.getAssessmentIdFromId(progressionId);

      // Then
      expect(assessmentId).to.equal(expectedAssessmentId);
    });
  });
});
