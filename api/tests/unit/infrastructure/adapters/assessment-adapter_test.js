const { describe, it, expect } = require('../../../test-helper');

const Bookshelf = require('../../../../lib/infrastructure/bookshelf');
const assessmentAdapter = require('../../../../lib/infrastructure/adapters/assessment-adapter');
const CatAssessment = require('../../../../lib/cat/assessment');
const CatCourse = require('../../../../lib/cat/course');
const CatSkill = require('../../../../lib/cat/skill');
const CatChallenge = require('../../../../lib/cat/challenge');
const CatAnswer = require('../../../../lib/cat/answer');
const Answer = require('../../../../lib/infrastructure/data/answer');

describe('Unit | Adapter | Assessment', () => {

  describe('#getAdaptedAssessment', () => {
    it('should return an Assessment from the Cat repository', () => {
      // given
      const skills = [];
      const challenges = [];
      const answers = [];

      // when
      const adaptedAssessment = assessmentAdapter.getAdaptedAssessment(answers, challenges, skills);

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
      const adaptedAssessment = assessmentAdapter.getAdaptedAssessment(answers, challenges, skills);

      // then
      expect(adaptedAssessment).to.have.property('course').and.to.be.an.instanceOf(CatCourse);

      const { course } = adaptedAssessment;
      expect(course).to.have.property('competenceSkills').and.to.be.an.instanceOf(Set);

      const expectedSetOfSkills = new Set([new CatSkill('web3')]);
      expect(course.competenceSkills).to.deep.equal(expectedSetOfSkills);
    });

    describe('the assessment\'s course ', () => {
      it('should have an array of challenges', () => {
        // given
        const skills = [];
        const challenges = [{
          id: 256,
          status: 'validé',
          skills: [],
          timer: 26
        }];
        const answers = [];

        // when
        const adaptedAssessment = assessmentAdapter.getAdaptedAssessment(answers, challenges, skills);

        // then
        const { course } = adaptedAssessment;
        expect(course).to.have.property('challenges');
        expect(course.challenges[0]).to.deep.equal(new CatChallenge(256, 'validé', [], 26));
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
        const adaptedAssessment = assessmentAdapter.getAdaptedAssessment(answers, challenges, skills);

        // then
        const { course } = adaptedAssessment;
        expect(course).to.have.property('challenges');
        expect(course.challenges).to.have.lengthOf(0);
      });

      it('should have challenges with skills', () => {
        // given
        const skills = [];
        const challenges = [{
          id: 256,
          status: 'validé',
          skills: [{ name: 'url6' }],
          timer: 26
        }];
        const answers = [];

        // when
        const adaptedAssessment = assessmentAdapter.getAdaptedAssessment(answers, challenges, skills);

        // then
        const challenge  = adaptedAssessment.course.challenges[0];
        expect(challenge.skills).to.deep.equal([new CatSkill('url6')]);
      });
    });

    describe('the assessment\'s answers', () => {

      const AnswerCollection = Bookshelf.Collection.extend({
        model: Answer
      });

      it('should have an array of challenges', () => {
        // given
        const skills = [];
        const challenges = [{
          id: 256,
          status: 'validé',
          skills: [],
          timer: 26
        }];

        const answersGiven = AnswerCollection.forge([new Answer({
          id: 42,
          challengeId: 256,
          result: '#ABAND#'
        })]);

        // when
        const adaptedAssessment = assessmentAdapter.getAdaptedAssessment(answersGiven, challenges, skills);

        // then
        const { answers } = adaptedAssessment;
        expect(answers).to.deep.equal([new CatAnswer(new CatChallenge(256, 'validé', [], 26), '#ABAND#')]);
      });
    });
  });

});
