const Progression = require('../../../../lib/domain/models/Progression');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | Progression', () => {

  const [skillLevel1, skillLevel2, skillLevel3] = domainBuilder.buildSkillCollection();

  describe('#completionRate', () => {

    context('when the profile is not fully evaluated', () => {

      context('and there is no knowledge elements',() => {

        it('should return a completionRate of 0', () => {
          // Given
          const targetedSkills = [skillLevel1, skillLevel2, skillLevel3];
          const knowledgeElements = [];

          // When
          const progression = new Progression({ targetedSkills, knowledgeElements, isProfileCompleted: false });

          // Then
          expect(progression.completionRate).to.eq(0);
        });

      });

      context('and knowledge elements are present', () => {

        it('should return 1 when all targeted skills are evaluated', () => {
          // Given
          const targetedSkills = [skillLevel1, skillLevel2];
          const knowledgeElements = [
            domainBuilder.buildKnowledgeElement({ skillId: skillLevel1.id }),
            domainBuilder.buildKnowledgeElement({ skillId: skillLevel2.id })
          ];

          // When
          const progression = new Progression({ targetedSkills, knowledgeElements, isProfileCompleted: false });

          // Then
          expect(progression.completionRate).to.eq(1);
        });

        it('should return a ratio different than 1 when some targeted skills are not evaluated', () => {
          // Given
          const targetedSkills = [skillLevel1, skillLevel2, skillLevel3];
          const knowledgeElements = [
            domainBuilder.buildKnowledgeElement({ skillId: skillLevel1.id }),
            domainBuilder.buildKnowledgeElement({ skillId: skillLevel2.id })
          ];

          // When
          const progression = new Progression({ targetedSkills, knowledgeElements, isProfileCompleted: false });

          // Then
          expect(progression.completionRate).to.eq(0.6666666666666666);
        });

      });

      context('and the profile contains knowledge elements on skills not in the targeted skills ', () => {

        it('should not take them into account and mark the completion at 1 (equal 100%)', () => {
          // Given
          const targetedSkills = [skillLevel1];
          const knowledgeElements = [
            domainBuilder.buildKnowledgeElement({ skillId: skillLevel1.id, status: 'invalidated' }),
            domainBuilder.buildKnowledgeElement({ skillId: skillLevel2.id, status: 'invalidated' })
          ];

          // When
          const progression = new Progression({ targetedSkills, knowledgeElements, isProfileCompleted: false  });

          // Then
          expect(progression.completionRate).to.eq(1);
        });

      });

    });

    context('when the profile is fully evaluated', () => {

      it('should return the completionRate of 1', () => {
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

  describe('#generateIdFromAssessmentId', () => {

    it('should return the id prepended with "progression-"', () => {
      // Given
      const assessmentId = 12345;
      const expectedProgressionId = `progression-${assessmentId}`;

      // When
      const progressionId = Progression.generateIdFromAssessmentId(assessmentId);

      // Then
      expect(progressionId).to.equal(expectedProgressionId);
    });
  });

  describe('#getAssessmentIdFromId', () => {

    it('should return the id without the "progression-"', () => {
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
