const SkillReview = require('../../../../lib/domain/models/SkillReview');
const { expect, factory } = require('../../../test-helper');

describe('Unit | Domain | Models | SkillReview', () => {

  const skills = [
    factory.buildSkill(),
    factory.buildSkill(),
  ];
  /*
    const challenge1 = factory.buildChallenge();
    const challenge2 = factory.buildChallenge();
  */
  const course = factory.buildCourse({});
  const assessment = factory.buildAssessment({ course });
  const targetProfile = factory.buildTargetProfile({ skills });

  describe('SkillReview', () => {

    it('should be built from an Assessment and a TargetProfile', () => {
      // When
      const skillReview = new SkillReview({ assessment, targetProfile });

      // Then
      expect(skillReview).to.have.property('assessment', assessment);
      expect(skillReview).to.have.property('targetProfile', targetProfile);
    });

  });

  describe('#progressionRate', () => {

    context('when no answer given yet', () => {
      it('should returns the progressionRate of 0 ', () => {
        // Given
        const assessment = factory.buildAssessment({ course });
        const targetProfile = factory.buildTargetProfile({ skills });

        // When
        const skillReview = new SkillReview({ assessment, targetProfile });

        // Then
        expect(skillReview.progressionRate).to.eq(0);
      });
    });

    it('should returns the progression rate of the targetProfile ', () => {
      const skills = [
        factory.buildSkill({ name: '@web4' })
      ];

      // Given
      const assessment = factory.buildAssessment({ course });
      const targetProfile = factory.buildTargetProfile({ skills });

      // When
      const skillReview = new SkillReview({ assessment, targetProfile });

      // Then
      expect(skillReview.progressionRate).to.eq(0);
    });
  });
});
