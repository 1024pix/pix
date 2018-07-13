const SkillReview = require('../../../../lib/domain/models/SkillReview');
const { expect, factory } = require('../../../test-helper');

describe('Unit | Domain | Models | SkillReview', () => {

  const [skillLevel1, skillLevel2, skillLevel3] = factory.buildSkillCollection();

  describe('#profileMasteryRate', () => {

    context('when no skill are validated nor failed', () => {
      it('should returns the profileMasteryRate of 0 ', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2, skillLevel3];
        const validatedSkills = [];
        const failedSkills = [];

        // When
        const skillReview = new SkillReview({ targetedSkills, validatedSkills, failedSkills });

        // Then
        expect(skillReview.profileMasteryRate).to.eq(0);
      });
    });

    context('with an answer given', () => {
      it('should returns the progression rate of the targetProfile ', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2];
        const validatedSkills = [skillLevel1];
        const failedSkills = [];

        // When
        const skillReview = new SkillReview({ targetedSkills, validatedSkills, failedSkills });

        // Then
        expect(skillReview.profileMasteryRate).to.eq(0.5);
      });
    });

    context('when an evaluated skill is not contained in the target profile', () => {
      it('should not take that extra validated skill into account', () => {
        // Given
        const targetedSkills = [skillLevel1];
        const validatedSkills = [skillLevel1, skillLevel2];
        const failedSkills = [];

        // When
        const skillReview = new SkillReview({ targetedSkills, validatedSkills, failedSkills });

        // Then
        expect(skillReview.profileMasteryRate).to.eq(1);
      });
    });
  });

  describe('#profileCompletionRate', () => {

    context('when no skill are validated nor failed', () => {
      it('should returns the profileCompletionRate of 0', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2, skillLevel3];
        const validatedSkills = [];
        const failedSkills = [];

        // When
        const skillReview = new SkillReview({ targetedSkills, validatedSkills, failedSkills });

        // Then
        expect(skillReview.profileCompletionRate).to.eq(0);
      });
    });

    context('with the profile is fully evaluated', () => {
      it('should returns a profileCompletionRate of 1 when there is a 50/50 answers ratio', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2];
        const validatedSkills = [skillLevel1];
        const failedSkills = [skillLevel2];

        // When
        const skillReview = new SkillReview({ targetedSkills, validatedSkills, failedSkills });

        // Then
        expect(skillReview.profileCompletionRate).to.eq(1);
      });

      it('should returns a profileCompletionRate of 1 when all skills are failed', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2];
        const validatedSkills = [];
        const failedSkills = [skillLevel1, skillLevel2];

        // When
        const skillReview = new SkillReview({ targetedSkills, validatedSkills, failedSkills });

        // Then
        expect(skillReview.profileCompletionRate).to.eq(1);
      });

      it('should returns a profileCompletionRate of 1 when all skills are validated', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2];
        const validatedSkills = [skillLevel1, skillLevel2];
        const failedSkills = [];

        // When
        const skillReview = new SkillReview({ targetedSkills, validatedSkills, failedSkills });

        // Then
        expect(skillReview.profileCompletionRate).to.eq(1);
      });

      it('should returns a profileCompletionRate of 1 when some skills were not suited to be evaluated (too hard, no question)', () => {
        // Given
        const targetedSkills = [skillLevel1, skillLevel2];
        const validatedSkills = [skillLevel1];
        const failedSkills = [];
        const unratableSkills = [skillLevel2];

        // When
        const skillReview = new SkillReview({ targetedSkills, validatedSkills, failedSkills, unratableSkills });

        // Then
        expect(skillReview.profileCompletionRate).to.eq(1);
      });

    });

    context('when the skillProfile contains no skill', () => {
      it('should returns a progression rate of 0', () => {
        // Given
        const targetedSkills = [];
        const validatedSkills = [skillLevel1];
        const failedSkills = [];

        // When
        const skillReview = new SkillReview({ targetedSkills, validatedSkills, failedSkills });

        // Then
        expect(skillReview.profileCompletionRate).to.eq(0);
      });
    });

    context('when the skillProfile contains extra skills', () => {
      it('should returns a progression rate of 0', () => {
        // Given
        const targetedSkills = [skillLevel1];
        const validatedSkills = [skillLevel1, skillLevel2];
        const failedSkills = [];

        // When
        const skillReview = new SkillReview({ targetedSkills, validatedSkills, failedSkills });

        // Then
        expect(skillReview.profileCompletionRate).to.eq(1);
      });

      it('should mark the completion at 1 (equal 100%)', () => {
        // Given
        const targetedSkills = [skillLevel1];
        const validatedSkills = [];
        const failedSkills = [skillLevel1, skillLevel2];

        // When
        const skillReview = new SkillReview({ targetedSkills, validatedSkills, failedSkills });

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
