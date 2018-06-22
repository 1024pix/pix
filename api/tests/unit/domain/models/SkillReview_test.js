const SkillReview = require('../../../../lib/domain/models/SkillReview');
const { expect, factory } = require('../../../test-helper');

describe('Unit | Domain | Models | SkillReview', () => {

  const [skillLevel1, skillLevel2, skillLevel3] = factory.buildSkillCollection();

  describe('#profileMasteryRate', () => {

    context('when no skill are validated nor failed', () => {
      it('should returns the profileMasteryRate of 0 ', () => {
        // Given
        const tragetedSkills = [skillLevel1, skillLevel2, skillLevel3];
        const validatedSkills = [];
        const failedSkills = [];

        // When
        const skillReview = new SkillReview({ tragetedSkills, validatedSkills, failedSkills });

        // Then
        expect(skillReview.profileMasteryRate).to.eq(0);
      });
    });

    context('with an answer given', () => {
      it('should returns the progression rate of the targetProfile ', () => {
        // Given
        const tragetedSkills = [skillLevel1, skillLevel2];
        const validatedSkills = [skillLevel1];
        const failedSkills = [];

        // When
        const skillReview = new SkillReview({ tragetedSkills, validatedSkills, failedSkills });

        // Then
        expect(skillReview.profileMasteryRate).to.eq(0.5);
      });
    });

    context('with the skillProfile contains no skill', () => {
      it('should returns a progression rate of 0', () => {
        // Given
        const tragetedSkills = [];
        const validatedSkills = [skillLevel1];
        const failedSkills = [];

        // When
        const skillReview = new SkillReview({ tragetedSkills, validatedSkills, failedSkills });

        // Then
        expect(skillReview.profileMasteryRate).to.eq(0);
      });
    });
  });
});
