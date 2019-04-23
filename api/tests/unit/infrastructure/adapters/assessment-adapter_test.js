const { expect, domainBuilder } = require('../../../test-helper');
const assessmentAdapter = require('../../../../lib/infrastructure/adapters/assessment-adapter');
const CatAssessment = require('../../../../lib/cat/assessment');
const CatCourse = require('../../../../lib/cat/course');
const CatSkill = require('../../../../lib/cat/skill');
const CatAnswer = require('../../../../lib/cat/answer');
const Answer = require('../../../../lib/domain/models/Answer');

describe('Unit | Adapter | Assessment', () => {

  const defaultRawSkillAttrs = { name: '@web1' };
  const defaultRawSkillCollection = [ defaultRawSkillAttrs ];
  const defaultRawChallengeAttrs = {
    id: 12,
    status: 'validé',
    skills: defaultRawSkillCollection,
    timer: 26,
  };
  const defaultCatSkill = new CatSkill(defaultRawSkillAttrs.name);
  const defaultCatChallenge = domainBuilder.buildCatChallenge(
    Object.assign({}, defaultRawChallengeAttrs, {
      skills: [defaultCatSkill]
    })
  );

  describe('#getAdaptedAssessment', () => {

    const assessmentId = 0;

    it('should return an Assessment from the Cat repository', () => {
      // given
      const skills = defaultRawSkillCollection;
      const challenges = [];
      const answers = [];

      // when
      const adaptedAssessment = assessmentAdapter.getAdaptedAssessment(assessmentId, answers, challenges, skills);

      // then
      expect(adaptedAssessment).to.be.an.instanceOf(CatAssessment);
    });

    it('should add a course with a list of skills', () => {
      // given
      const web3Skill = { name: 'web3' };
      const skills = [web3Skill];
      const challenges = [];
      const answers = [];

      // when
      const adaptedAssessment = assessmentAdapter.getAdaptedAssessment(assessmentId, answers, challenges, skills);

      // then
      expect(adaptedAssessment).to.have.property('course').and.to.be.an.instanceOf(CatCourse);

      const { course } = adaptedAssessment;
      expect(course).to.have.property('competenceSkills').and.to.be.an.instanceOf(Array);

      const expectedSetOfSkills = [new CatSkill('web3')];
      expect(course.competenceSkills).to.deep.equal(expectedSetOfSkills);
    });

    describe('the assessment\'s course ', () => {

      it('should have an array of challenges', () => {
        // given
        const skills = [];
        const challenges = [ defaultRawChallengeAttrs ];
        const answers = [];
        const expectedChallenge = defaultCatChallenge;

        // when
        const adaptedAssessment = assessmentAdapter.getAdaptedAssessment(assessmentId, answers, challenges, skills);

        // then
        const { course } = adaptedAssessment;
        expect(course).to.have.property('challenges');
        expect(course.challenges[0]).to.deep.equal(expectedChallenge);
      });

      it('should not select challenges without skills', () => {
        // given
        const skills = [];
        const challenges = [{
          id: 256,
          status: 'validé',
          timer: 26
        }];
        const answers = [];

        // when
        const adaptedAssessment = assessmentAdapter.getAdaptedAssessment(assessmentId, answers, challenges, skills);

        // then
        const { course } = adaptedAssessment;
        expect(course).to.have.property('challenges');
        expect(course.challenges).to.have.lengthOf(0);
      });

      it('should have challenges with skills', () => {
        // given
        const skills = [];
        const challenges = [
          Object.assign({}, defaultRawChallengeAttrs, {
            skills: [{ name: 'url6' }],
          })
        ];
        const answers = [];

        // when
        const adaptedAssessment = assessmentAdapter.getAdaptedAssessment(assessmentId, answers, challenges, skills);

        // then
        const challenge  = adaptedAssessment.course.challenges[0];
        expect(challenge.skills).to.deep.equal([new CatSkill('url6')]);
      });
    });

    describe('the assessment\'s answers', () => {

      it('should have an array of challenges', () => {
        // given
        const skills = defaultRawSkillCollection;
        const challenge = Object.assign({}, defaultRawChallengeAttrs, { skills });
        const expectedChallenge = defaultCatChallenge;

        const answersGiven = [new Answer({ id: 42, challengeId: challenge.id, result: 'aband' })];

        // when
        const adaptedAssessment = assessmentAdapter.getAdaptedAssessment(assessmentId, answersGiven, [challenge], skills);

        // then
        const { answers } = adaptedAssessment;
        expect(answers).to.deep.equal([new CatAnswer(expectedChallenge, 'aband')]);
      });
    });
  });

});
