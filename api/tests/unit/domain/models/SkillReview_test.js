const SkillReview = require('../../../../lib/domain/models/SkillReview');
const { expect, factory } = require('../../../test-helper');

describe('Unit | Domain | Models | SkillReview', () => {

  const skillWeb1 = factory.buildSkill({ name: '@web1' });
  const skillWeb2 = factory.buildSkill({ name: '@web2' });
  const skills = [skillWeb1, skillWeb2];

  const challengeForWeb1 = factory.buildChallenge({ skills: [skillWeb1] });
  const challengeForWeb2 = factory.buildChallenge({ skills: [skillWeb2] });
  const challenges = [challengeForWeb1, challengeForWeb2];

  const course = factory.buildCourse({ challenges });
  course.computeTubes(skills);

  describe('SkillReview', () => {

    it('should be built from an Assessment and a TargetProfile', () => {
      // Given
      const assessment = factory.buildAssessment({ course });
      const targetProfile = factory.buildTargetProfile({ skills });

      // When
      const skillReview = new SkillReview({ assessment, targetProfile });

      // Then
      expect(skillReview).to.have.property('assessment', assessment);
      expect(skillReview).to.have.property('targetProfile', targetProfile);
    });

    it('should have an id built from its assessment', () => {
      // Given
      const assessment = factory.buildAssessment({ course });
      const targetProfile = factory.buildTargetProfile({ skills });
      const expectedId = assessment.id;

      // When
      const skillReview = new SkillReview({ assessment, targetProfile });

      // Then
      expect(skillReview).to.have.property('id', expectedId);
    });

  });

  describe('#profileMastery', () => {

    context('when no answer given yet', () => {
      it('should returns the profileMastery of 0 ', () => {
        // Given
        const assessment = factory.buildAssessment({ course });
        const targetProfile = factory.buildTargetProfile({ skills });

        // When
        const skillReview = new SkillReview({ assessment, targetProfile });

        // Then
        expect(skillReview.profileMastery).to.eq(0);
      });
    });

    context('with an answer given', () => {
      it('should returns the progression rate of the targetProfile ', () => {
        // Given
        const answers = [ factory.buildAnswer({ challengeId: challengeForWeb1.id }) ];
        const assessment = factory.buildAssessment({ answers, course, challenges });
        const targetProfile = factory.buildTargetProfile({ skills });

        // When
        const skillReview = new SkillReview({ assessment, targetProfile });

        // Then
        expect(skillReview.profileMastery).to.eq(0.5);
      });
    });

    context('with the skillProfile contains no skill', () => {
      it('should returns a progression rate of 0', () => {
        // Given
        const assessment = factory.buildAssessment({ course, challenges });
        const targetProfile = factory.buildTargetProfile();

        // When
        const skillReview = new SkillReview({ assessment, targetProfile });

        // Then
        expect(skillReview.profileMastery).to.eq(0);
      });
    });

  });
});
