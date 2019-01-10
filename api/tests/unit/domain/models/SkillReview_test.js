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
        const skillReview = new SkillReview({ targetedSkills, knowledgeElements, isProfileCompleted: true });

        // Then
        expect(skillReview.profileMasteryRate).to.eq(0);
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
        const skillReview = new SkillReview({ targetedSkills, knowledgeElements, isProfileCompleted: true  });

        // Then
        expect(skillReview.profileMasteryRate).to.eq(1);
      });

      it('should returns 0 when there is one skill and one validated knowledge element but not on this skill', () => {
        // Given
        const targetedSkills = [skillLevel1];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel2.id, status: 'validated' })
        ];

        // When
        const skillReview = new SkillReview({ targetedSkills, knowledgeElements, isProfileCompleted: true  });

        // Then
        expect(skillReview.profileMasteryRate).to.eq(0);
      });

      it('should returns the percentage of validated skills when all skills are not tested', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id, status: 'validated' })
        ];

        // When
        const skillReview = new SkillReview({ targetedSkills, knowledgeElements, isProfileCompleted: true  });

        // Then
        expect(skillReview.profileMasteryRate).to.eq(0.5);
      });

      it('should returns the percentage of validated skills when there is an invalidated one', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id, status: 'validated' }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel2.id, status: 'invalidated' })
        ];

        // When
        const skillReview = new SkillReview({ targetedSkills, knowledgeElements, isProfileCompleted: true  });

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
        const skillReview = new SkillReview({ targetedSkills, knowledgeElements, isProfileCompleted: true  });

        // Then
        expect(skillReview.profileMasteryRate).to.eq(1);
      });

    });

  });

  describe('#profileCompletionRate', () => {

    context('when the profile is not fully evaluated', () => {

      context('and there is no knowledge elements',() => {

        it('should returns a profileCompletionRate of 0', () => {
          // Given
          const targetedSkills = [skillLevel1, skillLevel2, skillLevel3];
          const knowledgeElements = [];

          // When
          const skillReview = new SkillReview({ targetedSkills, knowledgeElements, isProfileCompleted: false });

          // Then
          expect(skillReview.profileCompletionRate).to.eq(0);
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
          const skillReview = new SkillReview({ targetedSkills, knowledgeElements, isProfileCompleted: false });

          // Then
          expect(skillReview.profileCompletionRate).to.eq(1);
        });

        it('should returns a ratio different than 1 when some targeted skills are not evaluated', () => {
          // Given
          const targetedSkills = [skillLevel1, skillLevel2, skillLevel3];
          const knowledgeElements = [
            domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel1.id }),
            domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skillLevel2.id })
          ];

          // When
          const skillReview = new SkillReview({ targetedSkills, knowledgeElements, isProfileCompleted: false });

          // Then
          expect(skillReview.profileCompletionRate).to.eq(0.6666666666666666);
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
          const skillReview = new SkillReview({ targetedSkills, knowledgeElements, isProfileCompleted: false  });

          // Then
          expect(skillReview.profileCompletionRate).to.eq(1);
        });

      });

    });

    context('when the profile is fully evaluated', () => {

      it('should returns the profileCompletionRate of 1', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2, skillLevel3];
        const knowledgeElements = [];

        // When
        const skillReview = new SkillReview({ targetedSkills, knowledgeElements, isProfileCompleted: true });

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
