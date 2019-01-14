const SmartPlacementProgression = require('../../../../lib/domain/models/SmartPlacementProgression');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | SmartPlacementProgression', () => {

  const [skillLevel1, skillLevel2, skillLevel3] = domainBuilder.buildSkillCollection();

  describe('#masteryRate', () => {

    context('when there is no knowledge-elements', () => {

      it('should returns the masteryRate of 0 ', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2, skillLevel3];
        const knowledgeElements = [];

        // When
        const smartPlacementProgression = new SmartPlacementProgression({ targetedSkills, knowledgeElements, isProfileCompleted: true });

        // Then
        expect(smartPlacementProgression.masteryRate).to.eq(0);
      });
    });

    context('with knowledge-elements', () => {

      it('should returns 1 when there is only one skill and it is validated by one knowledge element', () => {
        // Given
        const targetedSkills = [skillLevel1];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id, status: 'validated' })
        ];

        // When
        const smartPlacementProgression = new SmartPlacementProgression({ targetedSkills, knowledgeElements, isProfileCompleted: true  });

        // Then
        expect(smartPlacementProgression.masteryRate).to.eq(1);
      });

      it('should returns 0 when there is one skill and one validated knowledge element but not on this skill', () => {
        // Given
        const targetedSkills = [skillLevel1];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel2.id, status: 'validated' })
        ];

        // When
        const smartPlacementProgression = new SmartPlacementProgression({ targetedSkills, knowledgeElements, isProfileCompleted: true  });

        // Then
        expect(smartPlacementProgression.masteryRate).to.eq(0);
      });

      it('should returns the percentage of validated skills when all skills are not tested', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id, status: 'validated' })
        ];

        // When
        const smartPlacementProgression = new SmartPlacementProgression({ targetedSkills, knowledgeElements, isProfileCompleted: true  });

        // Then
        expect(smartPlacementProgression.masteryRate).to.eq(0.5);
      });

      it('should returns the percentage of validated skills when there is an invalidated one', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id, status: 'validated' }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel2.id, status: 'invalidated' })
        ];

        // When
        const smartPlacementProgression = new SmartPlacementProgression({ targetedSkills, knowledgeElements, isProfileCompleted: true  });

        // Then
        expect(smartPlacementProgression.masteryRate).to.eq(0.5);
      });

    });

    context('when an evaluated skill is not contained in the target profile', () => {

      it('should not take that extra validated skill into account', () => {
        // Given
        const targetedSkills = [skillLevel1];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id, status: 'validated' }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel2.id, status: 'validated' })
        ];

        // When
        const smartPlacementProgression = new SmartPlacementProgression({ targetedSkills, knowledgeElements, isProfileCompleted: true  });

        // Then
        expect(smartPlacementProgression.masteryRate).to.eq(1);
      });

    });

  });

  describe('#completionRate', () => {

    context('when the profile is not fully evaluated', () => {

      context('and there is no knowledge elements',() => {

        it('should returns a completionRate of 0', () => {
          // Given
          const targetedSkills = [skillLevel1, skillLevel2, skillLevel3];
          const knowledgeElements = [];

          // When
          const smartPlacementProgression = new SmartPlacementProgression({ targetedSkills, knowledgeElements, isProfileCompleted: false });

          // Then
          expect(smartPlacementProgression.completionRate).to.eq(0);
        });

      });

      context('and knowledge elements are present', () => {

        it('should returns 1 when all targeted skills are evaluated', () => {
          // Given
          const targetedSkills = [skillLevel1, skillLevel2];
          const knowledgeElements = [
            domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id }),
            domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel2.id })
          ];

          // When
          const smartPlacementProgression = new SmartPlacementProgression({ targetedSkills, knowledgeElements, isProfileCompleted: false });

          // Then
          expect(smartPlacementProgression.completionRate).to.eq(1);
        });

        it('should returns a ratio different than 1 when some targeted skills are not evaluated', () => {
          // Given
          const targetedSkills = [skillLevel1, skillLevel2, skillLevel3];
          const knowledgeElements = [
            domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id }),
            domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel2.id })
          ];

          // When
          const smartPlacementProgression = new SmartPlacementProgression({ targetedSkills, knowledgeElements, isProfileCompleted: false });

          // Then
          expect(smartPlacementProgression.completionRate).to.eq(0.6666666666666666);
        });

      });

      context('and the profile contains knowledge elements on skills not in the targeted skills ', () => {

        it('should not take them into account and mark the completion at 1 (equal 100%)', () => {
          // Given
          const targetedSkills = [skillLevel1];
          const knowledgeElements = [
            domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id, status: 'invalidated' }),
            domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel2.id, status: 'invalidated' })
          ];

          // When
          const smartPlacementProgression = new SmartPlacementProgression({ targetedSkills, knowledgeElements, isProfileCompleted: false  });

          // Then
          expect(smartPlacementProgression.completionRate).to.eq(1);
        });

      });

    });

    context('when the profile is fully evaluated', () => {

      it('should returns the completionRate of 1', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2, skillLevel3];
        const knowledgeElements = [];

        // When
        const smartPlacementProgression = new SmartPlacementProgression({ targetedSkills, knowledgeElements, isProfileCompleted: true });

        // Then
        expect(smartPlacementProgression.completionRate).to.eq(1);
      });

    });

  });

  describe('#generateIdFromAssessmentId', () => {

    it('should returns the id prepended with "smart-placement-progression-"', () => {
      // Given
      const assessmentId = 12345;
      const expectedSmartPlacementProgressionId = `smart-placement-progression-${assessmentId}`;

      // When
      const smartPlacementProgressionId = SmartPlacementProgression.generateIdFromAssessmentId(assessmentId);

      // Then
      expect(smartPlacementProgressionId).to.equal(expectedSmartPlacementProgressionId);
    });
  });

  describe('#getAssessmentIdFromId', () => {

    it('should returns the id without the "smart-placement-progression-"', () => {
      // Given
      const expectedAssessmentId = 12345;
      const smartPlacementProgressionId = `smart-placement-progression-${expectedAssessmentId}`;

      // When
      const assessmentId = SmartPlacementProgression.getAssessmentIdFromId(smartPlacementProgressionId);

      // Then
      expect(assessmentId).to.equal(expectedAssessmentId);
    });
  });
});
