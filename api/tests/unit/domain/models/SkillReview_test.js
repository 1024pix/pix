const SkillReview = require('../../../../lib/domain/models/SkillReview');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | SkillReview', () => {

  const [skillLevel1, skillLevel2, skillLevel3] = domainBuilder.buildSkillCollection();

  describe('#profileMasteryRate', () => {

    context('when there is no knowledge-elements', () => {
      it('should returns the profileMasteryRate of 0 ', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2, skillLevel3];
        const knowledgeElements = [];

        // When
        const skillReview = new SkillReview({ targetedSkills, knowledgeElements, computeUnratableSkill: true });

        // Then
        expect(skillReview.profileMasteryRate).to.eq(0);
      });
    });

    context('with knowledge-elements', () => {

      it('should returns 1 when there is one skill which is validated by one knowledge elements', () => {
        // Given
        const targetedSkills = [skillLevel1];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id, status: 'validated' })
        ];

        // When
        const skillReview = new SkillReview({ targetedSkills, knowledgeElements, computeUnratableSkill: true  });

        // Then
        expect(skillReview.profileMasteryRate).to.eq(1);
      });

      it('should returns the percentage of validated skills even if all skills are not tested', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id, status: 'validated' })
        ];

        // When
        const skillReview = new SkillReview({ targetedSkills, knowledgeElements, computeUnratableSkill: true  });

        // Then
        expect(skillReview.profileMasteryRate).to.eq(0.5);
      });

      it('should returns the percentage of validated skills even if there is an invalidated one', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id, status: 'validated' }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel2.id, status: 'invalidated' })
        ];

        // When
        const skillReview = new SkillReview({ targetedSkills, knowledgeElements, computeUnratableSkill: true  });

        // Then
        expect(skillReview.profileMasteryRate).to.eq(0.5);
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
        const skillReview = new SkillReview({ targetedSkills, knowledgeElements, computeUnratableSkill: true  });

        // Then
        expect(skillReview.profileMasteryRate).to.eq(1);
      });
    });

  });

  describe('#profileCompletionRate', () => {

    context('when there is no knowledge elements', () => {
      context('when we compute unratableSkill',() => {
        it('should returns the profileCompletionRate of 1', () => {
          // Given
          const targetedSkills = [skillLevel1, skillLevel2, skillLevel3];
          const knowledgeElements = [];

          // When
          const skillReview = new SkillReview({ targetedSkills, knowledgeElements, computeUnratableSkill: true  });

          // Then
          expect(skillReview.profileCompletionRate).to.eq(1);
        });
      });
      context('when we do not compute unratableSkill',() => {
        it('should returns the profileCompletionRate of 0', () => {
          // Given
          const targetedSkills = [skillLevel1, skillLevel2, skillLevel3];
          const knowledgeElements = [];

          // When
          const skillReview = new SkillReview({ targetedSkills, knowledgeElements, computeUnratableSkill: false  });

          // Then
          expect(skillReview.profileCompletionRate).to.eq(0);
        });
      });

    });

    context('with the profile is fully evaluated', () => {
      it('should returns a profileCompletionRate of 1 when there is a 50/50 answers ratio', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id, status: 'invalidated' }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel2.id, status: 'validated' })
        ];

        // When
        const skillReview = new SkillReview({ targetedSkills, knowledgeElements, computeUnratableSkill: true  });

        // Then
        expect(skillReview.profileCompletionRate).to.eq(1);
      });

      it('should returns a profileCompletionRate of 1 when all skills are failed', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id, status: 'invalidated' }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel2.id, status: 'invalidated' })
        ];

        // When
        const skillReview = new SkillReview({ targetedSkills, knowledgeElements, computeUnratableSkill: true  });

        // Then
        expect(skillReview.profileCompletionRate).to.eq(1);
      });

      it('should returns a profileCompletionRate of 1 when all skills are validated', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id, status: 'validated' }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel2.id, status: 'validated' })
        ];

        // When
        const skillReview = new SkillReview({ targetedSkills, knowledgeElements, computeUnratableSkill: true  });

        // Then
        expect(skillReview.profileCompletionRate).to.eq(1);
      });

      it('should returns a profileCompletionRate of 1 when some skills were not suited to be evaluated (too hard, no question)', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id, status: 'invalidated' }),
        ];

        // When
        const skillReview = new SkillReview({ targetedSkills, knowledgeElements, computeUnratableSkill: true  });

        // Then
        expect(skillReview.profileCompletionRate).to.eq(1);
      });

    });

    context('when the skillProfile contains extra skills', () => {
      it('should mark the completion at 1 (equal 100%)', () => {
        // Given
        const targetedSkills = [skillLevel1];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id, status: 'invalidated' }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel2.id, status: 'invalidated' })
        ];

        // When
        const skillReview = new SkillReview({ targetedSkills, knowledgeElements, computeUnratableSkill: true  });

        // Then
        expect(skillReview.profileCompletionRate).to.eq(1);
      });
    });
  });

  describe('#generateIdFromAssessmentId', () => {

    it('should returns the id prepended with "skill-review-"', () => {
      // Given
      const assessmentId = 12345;
      const expectedSkillReviewId = `skill-review-${assessmentId}`;

      // When
      const skillReviewId = SkillReview.generateIdFromAssessmentId(assessmentId);

      // Then
      expect(skillReviewId).to.equal(expectedSkillReviewId);
    });
  });

  describe('#getAssessmentIdFromId', () => {

    it('should returns the id without the "skill-review-"', () => {
      // Given
      const expectedAssessmentId = 12345;
      const skillReviewId = `skill-review-${expectedAssessmentId}`;

      // When
      const assessmentId = SkillReview.getAssessmentIdFromId(skillReviewId);

      // Then
      expect(assessmentId).to.equal(expectedAssessmentId);
    });
  });
});
