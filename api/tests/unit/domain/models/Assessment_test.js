const Assessment = require('../../../../lib/domain/models/Assessment');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Answer = require('../../../../lib/domain/models/Answer');
const Skill = require('../../../../lib/domain/models/Skill');
const Course = require('../../../../lib/domain/models/Course');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | Assessment', () => {

  describe('#isCompleted', () => {

    it('should return true when its state is completed', () => {
      // given
      const assessment = new Assessment({ state: 'completed' });

      // when
      const isCompleted = assessment.isCompleted();

      // then
      expect(isCompleted).to.be.true;
    });

    it('should return false when its state is not completed', () => {
      // given
      const assessment = new Assessment({ state: '' });

      // when
      const isCompleted = assessment.isCompleted();

      // then
      expect(isCompleted).to.be.false;
    });

  });

  describe('#getLastAssessmentResult', () => {

    it('should return the last assessment results', () => {
      // given
      const assessmentResultComputed = new AssessmentResult({
        id: 1,
        createdAt: '2017-12-20',
        emitter: 'PIX-ALGO'
      });
      const assessmentResultJury = new AssessmentResult({
        id: 2,
        createdAt: '2017-12-24',
        emitter: 'Michel'
      });

      const assessmentResultJuryOld = new AssessmentResult({
        id: 3,
        createdAt: '2017-12-22',
        emitter: 'Gerard'
      });

      const assessment = new Assessment({
        status: 'completed',
        assessmentResults: [assessmentResultComputed, assessmentResultJury, assessmentResultJuryOld]
      });

      // when
      const lastResult = assessment.getLastAssessmentResult();

      // then
      expect(lastResult.id).to.be.equal(2);
      expect(lastResult.emitter).to.be.equal('Michel');
    });

    it('should return null when assessment has no result', () => {
      // given
      const assessment = new Assessment({ status: '' });

      // when
      const lastResult = assessment.getLastAssessmentResult();

      // then
      expect(lastResult).to.be.null;
    });

  });

  describe('#getPixScore', () => {

    it('should return the pixScore of last assessment results', () => {
      // given
      const assessmentResultComputed = new AssessmentResult({
        id: 1,
        createdAt: '2017-12-20',
        pixScore: 12,
        emitter: 'PIX-ALGO'
      });
      const assessmentResultJury = new AssessmentResult({
        id: 2,
        createdAt: '2017-12-24',
        pixScore: 18,
        emitter: 'Michel'
      });

      const assessment = new Assessment({
        status: 'completed',
        assessmentResults: [assessmentResultComputed, assessmentResultJury]
      });

      // when
      const pixScore = assessment.getPixScore();

      // then
      expect(pixScore).to.be.equal(18);
    });

    it('should return null when assessment has no result', () => {
      // given
      const assessment = new Assessment({ status: '' });

      // when
      const pixScore = assessment.getPixScore();

      // then
      expect(pixScore).to.be.null;
    });

  });

  describe('#getLevel', () => {

    it('should return the pixScore of last assessment results', () => {
      // given
      const assessmentResultComputed = new AssessmentResult({
        id: 1,
        createdAt: '2017-12-20',
        level: 1,
        emitter: 'PIX-ALGO'
      });
      const assessmentResultJury = new AssessmentResult({
        id: 2,
        createdAt: '2017-12-24',
        level: 5,
        emitter: 'Michel'
      });

      const assessment = new Assessment({
        status: 'completed',
        assessmentResults: [assessmentResultComputed, assessmentResultJury]
      });

      // when
      const level = assessment.getLevel();

      // then
      expect(level).to.be.equal(5);
    });

    it('should return null when assessment has no result', () => {
      // given
      const assessment = new Assessment({ status: '' });

      // when
      const level = assessment.getLevel();

      // then
      expect(level).to.be.null;
    });

  });

  describe('#setCompleted', () => {

    it('should return the same object with state completed', () => {
      // given
      const assessment = new Assessment({ state: 'started', userId: 2 });

      // when
      assessment.setCompleted();

      // then
      expect(assessment.state).to.be.equal('completed');
      expect(assessment.userId).to.be.equal(2);

    });
  });

  describe('#validate', () => {
    let assessment;

    it('should return resolved promise when object is valid', () => {
      // given
      assessment = new Assessment({ type: 'DEMO' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.fulfilled;
    });

    it('should return resolved promise when Placement assessment is valid', () => {
      //given
      assessment = new Assessment({ userId: 3, type: 'PLACEMENT' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.fulfilled;
    });

    it('should return rejected promise when Placement assessment has no userId', () => {
      //given
      assessment = new Assessment({ type: 'PLACEMENT' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.rejected;
    });

    it('should return rejected promise when userId is null for placement', () => {
      //given
      assessment = new Assessment({ userId: null, type: 'PLACEMENT' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.rejected;
    });

  });

  describe('#isSmartPlacementAssessment', () => {
    it('should return true when the assessment is a SMART_PLACEMENT', () => {
      // given
      const assessment = new Assessment({ type: 'SMART_PLACEMENT' });

      // when
      const isSmartPlacementAssessment = assessment.isSmartPlacementAssessment();

      // then
      expect(isSmartPlacementAssessment).to.be.true;
    });

    it('should return false when the assessment is not a SMART_PLACEMENT', () => {
      // given
      const assessment = new Assessment({ type: 'PLACEMENT' });

      // when
      const isSmartPlacementAssessment = assessment.isSmartPlacementAssessment();

      // then
      expect(isSmartPlacementAssessment).to.be.false;
    });

    it('should return false when the assessment has no type', () => {
      // given
      const assessment = new Assessment({});

      // when
      const isSmartPlacementAssessment = assessment.isSmartPlacementAssessment();

      // then
      expect(isSmartPlacementAssessment).to.be.false;
    });
  });

  describe('#addAnswersWithTheirChallenge', () => {
    it('should add answers with their challenges at the assessment', () => {
      // given
      const assessment = new Assessment({ });
      const answerList = [
        new Answer({ challengeId: 1, value: 'truc' }),
        new Answer({ challengeId: 2, value: 'machin' })
      ];
      const challenge1 = new Challenge();
      challenge1.id = 1;
      const challenge2 = new Challenge();
      challenge2.id = 2;
      const challengeList = [
        challenge1,
        challenge2,
      ];

      // when
      assessment.addAnswersWithTheirChallenge(answerList, challengeList);

      // then
      expect(assessment.answers[0].value).to.equal('truc');
      expect(assessment.answers[0].challenge.id).to.equal(1);
      expect(assessment.answers[1].value).to.equal('machin');
      expect(assessment.answers[1].challenge.id).to.equal(2);
    });

  });

  describe('#computePixScore', () => {

    it('should be 0 if no skill has been validated', function() {
      // given
      const skillNames = ['@web1', '@chi1', '@web2', '@web3', '@chi3', '@fou3'];
      const skills = [];
      const competenceSkills = skillNames.map(skillName => skills[skillName] = new Skill({ name: skillName }));
      const ch2 = new Challenge();
      ch2.addSkill(skills['@web2']);
      const course = new Course([ch2], competenceSkills);
      course.tubes = { 'web': [skills['@web1'], skills['@web2'], skills['@web3']],
        'chi': [skills['@chi1'], skills['@chi3']],
        'fou': [skills['@fou3']] };
      course.competenceSkills = competenceSkills;
      const answer2 = new Answer({ result: AnswerStatus.KO });
      answer2.challenge = ch2;
      const assessment = new Assessment();
      assessment.course = course;
      assessment.answers = [answer2];

      // when
      const score = assessment.computePixScore();

      // then
      expect(score).to.be.deep.equal(0);
    });

    it('should be 8 if validated skills are web1 among 2 (4 pix), web2 (4 pix) but not web3 among 4 (2 pix)', () => {
      // given
      const skillNames = ['@web1', '@chi1', '@web2', '@web3', '@chi3', '@fou3', '@mis3'];
      const skills = [];
      const competenceSkills = skillNames.map(skillName => skills[skillName] = new Skill({ name: skillName }));
      const ch1 = new Challenge();
      ch1.addSkill(skills['@web1']);
      ch1.addSkill(skills['@web2']);
      const ch2 = new Challenge();
      ch2.addSkill(skills['@web3']);
      const course = new Course([ch1, ch2], competenceSkills);
      course.tubes = { 'web': [skills['@web1'], skills['@web2'], skills['@web3']],
        'chi': [skills['@chi1'], skills['@chi3']],
        'fou': [skills['@fou3']],
        'mis': [skills['@mis3']] };
      course.competenceSkills = competenceSkills;
      const answer1 = new Answer({ result: AnswerStatus.OK });
      answer1.challenge = ch1;
      const answer2 = new Answer({ result: AnswerStatus.KO });
      answer2.challenge = ch2;
      const assessment = new Assessment();
      assessment.course = course;
      assessment.answers = [answer1, answer2];

      // when
      const score = assessment.computePixScore();

      // then
      expect(score).to.be.deep.equal(8);

    });

    it('should be 6 if validated skills are web1 (4 pix) and fou3 among 4 (2 pix) (web2 was failed)', () => {
      // given
      const skillNames = ['@web1', '@chi1', '@web2', '@web3', '@chi3', '@fou3', '@mis3'];
      const skills = [];
      const competenceSkills = skillNames.map(skillName => skills[skillName] = new Skill({ name: skillName }));
      const ch1 = new Challenge();
      ch1.addSkill(skills['@web1']);
      const ch2 = new Challenge();
      ch2.addSkill(skills['@web2']);
      const ch3 = new Challenge();
      ch3.addSkill(skills['@fou3']);
      const course = new Course([ch1, ch2], competenceSkills);
      course.tubes = { 'web': [skills['@web1'], skills['@web2'], skills['@web3']],
        'chi': [skills['@chi1'], skills['@chi3']],
        'fou': [skills['@fou3']],
        'mis': [skills['@mis3']] };
      course.competenceSkills = competenceSkills;
      const answer1 = new Answer({ result: AnswerStatus.OK });
      answer1.challenge = ch1;
      const answer2 = new Answer({ result: AnswerStatus.KO });
      answer2.challenge = ch2;
      const answer3 = new Answer({ result: AnswerStatus.OK });
      answer3.challenge = ch3;

      const assessment = new Assessment();
      assessment.course = course;
      assessment.answers = [answer1, answer2, answer3];

      // when
      const score = assessment.computePixScore();

      // then
      expect(score).to.be.deep.equal(6);
    });

    context.skip('when one challenge was archived', () => {
      it('should return maximum score even if one answer has undefined challenge and skill do not exist anymore', () => {

        // given
        const skillNames = ['web1', 'web3', 'ch1', 'ch2', 'ch3', 'truc2'];
        const skills = {};
        const competenceSkills = skillNames.map(skillName => skills[skillName] = new Skill(skillName));
        const web1Challenge = new Challenge('a', 'validé', [skills['web1']]);
        const web3Challege = new Challenge('c', 'validé', [skills['web3']]);
        const ch1Challenge = new Challenge('a', 'validé', [skills['ch1']]);
        const ch2Challenge = new Challenge('b', 'archived', [skills['ch2']]);
        const ch3Challege = new Challenge('c', 'validé', [skills['ch3']]);
        const truc2Challege = new Challenge('c', 'validé', [skills['truc2']]);
        const course = new Course([web1Challenge, web3Challege, ch1Challenge, ch2Challenge, ch3Challege, truc2Challege], competenceSkills);
        const answer1 = new Answer(web1Challenge, AnswerStatus.OK);
        const answer2 = new Answer(undefined, AnswerStatus.OK);
        const answer3 = new Answer(web3Challege, AnswerStatus.OK);
        const answer4 = new Answer(ch1Challenge, AnswerStatus.OK);
        const answer5 = new Answer(ch2Challenge, AnswerStatus.OK);
        const answer6 = new Answer(ch3Challege, AnswerStatus.OK);
        const answer7 = new Answer(truc2Challege, AnswerStatus.OK);
        const assessment = new Assessment(course, [answer1, answer2, answer3, answer4, answer5, answer6, answer7]);

        // then
        expect(assessment.pixScore).to.be.equal(24);
      });

      it('should return maximum score even if one answer has undefined challenge and but skill exist', () => {

        // given
        const skillNames = ['web1', 'web2', 'web3', 'ch1', 'ch2', 'ch3'];
        const skills = {};
        const competenceSkills = skillNames.map(skillName => skills[skillName] = new Skill(skillName));
        const web1Challenge = new Challenge('a', 'validé', [skills['web1']]);
        const web2Challenge = new Challenge('a', 'validé', [skills['web2']]);
        const web3Challege = new Challenge('c', 'validé', [skills['web3']]);
        const ch1Challenge = new Challenge('a', 'validé', [skills['ch1']]);
        const ch2Challenge = new Challenge('b', 'archived', [skills['ch2']]);
        const ch3Challege = new Challenge('c', 'validé', [skills['ch3']]);
        const course = new Course([web1Challenge, web2Challenge, web3Challege, ch1Challenge, ch2Challenge, ch3Challege], competenceSkills);
        const answer1 = new Answer(web1Challenge, AnswerStatus.OK);
        const answer2 = new Answer(undefined, AnswerStatus.OK);
        const answer3 = new Answer(web3Challege, AnswerStatus.OK);
        const answer4 = new Answer(ch1Challenge, AnswerStatus.OK);
        const answer5 = new Answer(ch2Challenge, AnswerStatus.OK);
        const answer6 = new Answer(ch3Challege, AnswerStatus.OK);
        const assessment = new Assessment(course, [answer1, answer2, answer3, answer4, answer5, answer6]);

        // then
        expect(assessment.pixScore).to.be.equal(24);
      });
    });
  });

  describe('#validatedSkills', function() {

    it('should return [web1, web2] if the user answered correctly a question that requires web2', function() {
      // given
      const skillNames = ['@web1', '@chi1', '@web2', '@web3', '@chi3', '@fou3'];
      const skills = [];
      const competenceSkills = skillNames.map(skillName => skills[skillName] = new Skill({ name: skillName }));
      const ch1 = new Challenge();
      ch1.addSkill(skills['@web3']);
      const ch2 = new Challenge();
      ch2.addSkill(skills['@web2']);
      const course = new Course([ch2], competenceSkills);
      course.tubes = { 'web': [skills['@web1'], skills['@web2'], skills['@web3']],
        'chi': [skills['@chi1'], skills['@chi3']],
        'fou': [skills['@fou3']] };
      const answer1 = new Answer({ result: AnswerStatus.KO });
      answer1.challenge = ch1;
      const answer2 = new Answer({ result: AnswerStatus.OK });
      answer2.challenge = ch2;
      const assessment = new Assessment();
      assessment.course = course;
      assessment.answers = [answer1, answer2];

      // when
      const validatedSkills = assessment.getValidatedSkills();

      // then
      expect([...validatedSkills]).to.be.deep.equal([skills['@web1'], skills['@web2']]);
    });

    it('should not have the same skill validated twice', function() {
      // given
      const skillNames = ['@web1', '@chi1', '@web2', '@web3', '@chi3', '@fou3'];
      const skills = [];
      const competenceSkills = skillNames.map(skillName => skills[skillName] = new Skill({ name: skillName }));
      const ch1 = new Challenge();
      ch1.addSkill(skills['@web1']);
      const ch2 = new Challenge();
      ch2.addSkill(skills['@web2']);
      const course = new Course([ch2], competenceSkills);
      course.tubes = { 'web': [skills['@web1'], skills['@web2'], skills['@web3']],
        'chi': [skills['@chi1'], skills['@chi3']],
        'fou': [skills['@fou3']] };
      const answer1 = new Answer({ result: AnswerStatus.OK });
      answer1.challenge = ch1;
      const answer2 = new Answer({ result: AnswerStatus.OK });
      answer2.challenge = ch2;
      const assessment = new Assessment();
      assessment.course = course;
      assessment.answers = [answer1, answer2];

      // when
      const validatedSkills = assessment.getValidatedSkills();

      // then
      expect([...validatedSkills]).to.be.deep.equal([skills['@web1'], skills['@web2']]);

    });

  });

  describe('#failedSkills', function() {

    it('should return [web1, web2, web3] if the user fails a question that requires web1', function() {
      // given
      const skillNames = ['@web1', '@web2', '@web3'];
      const skills = [];
      const competenceSkills = skillNames.map(skillName => skills[skillName] = new Skill({ name: skillName }));
      const ch1 = new Challenge();
      ch1.addSkill(skills['@web1']);
      const course = new Course([ch1], competenceSkills);
      course.tubes = { 'web': [skills['@web1'], skills['@web2'], skills['@web3']] };
      const answer1 = new Answer({ result: AnswerStatus.KO });
      answer1.challenge = ch1;
      const assessment = new Assessment();
      assessment.course = course;
      assessment.answers = [answer1];

      // when
      const failedSkills = assessment.getFailedSkills();

      // then
      expect([...failedSkills]).to.be.deep.equal([skills['@web1'], skills['@web2'], skills['@web3']]);

    });
  });

});
