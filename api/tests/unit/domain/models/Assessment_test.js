const _ = require('lodash');
const { expect, factory } = require('../../../test-helper');

const Answer = require('../../../../lib/domain/models/Answer');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const Assessment = require('../../../../lib/domain/models/Assessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Course = require('../../../../lib/domain/models/Course');
const Skill = require('../../../../lib/domain/models/Skill');
const Tube = require('../../../../lib/domain/models/Tube');

function _newChallenge(skill) {
  const challenge = Challenge.fromAttributes();
  challenge.addSkill(skill);
  return challenge;
}

function _newAnswer(result, challenge) {
  const answer = new Answer({ result });
  answer.challenge = challenge;
  return answer;
}

function _newTube(skills) {
  return new Tube({ skills });
}

describe('Unit | Domain | Models | Assessment', () => {

  describe('#isCompleted', () => {

    it('should return true when its state is completed', () => {
      // given
      const assessment = Assessment.fromAttributes({ state: 'completed' });

      // when
      const isCompleted = assessment.isCompleted();

      // then
      expect(isCompleted).to.be.true;
    });

    it('should return false when its state is not completed', () => {
      // given
      const assessment = Assessment.fromAttributes({ state: '' });

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

      const assessment = Assessment.fromAttributes({
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
      const assessment = Assessment.fromAttributes({ status: '' });

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

      const assessment = Assessment.fromAttributes({
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
      const assessment = Assessment.fromAttributes({ status: '' });

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

      const assessment = Assessment.fromAttributes({
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
      const assessment = Assessment.fromAttributes({ status: '' });

      // when
      const level = assessment.getLevel();

      // then
      expect(level).to.be.null;
    });

  });

  describe('#setCompleted', () => {

    it('should return the same object with state completed', () => {
      // given
      const assessment = Assessment.fromAttributes({ state: 'started', userId: 2 });

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
      assessment = Assessment.fromAttributes({ type: 'DEMO' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.fulfilled;
    });

    it('should return resolved promise when Placement assessment is valid', () => {
      //given
      assessment = Assessment.fromAttributes({ userId: 3, type: 'PLACEMENT' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.fulfilled;
    });

    it('should return rejected promise when Placement assessment has no userId', () => {
      //given
      assessment = Assessment.fromAttributes({ type: 'PLACEMENT' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.rejected;
    });

    it('should return rejected promise when userId is null for placement', () => {
      //given
      assessment = Assessment.fromAttributes({ userId: null, type: 'PLACEMENT' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.rejected;
    });

  });

  describe('#isSmartPlacementAssessment', () => {
    it('should return true when the assessment is a SMART_PLACEMENT', () => {
      // given
      const assessment = Assessment.fromAttributes({ type: 'SMART_PLACEMENT' });

      // when
      const isSmartPlacementAssessment = assessment.isSmartPlacementAssessment();

      // then
      expect(isSmartPlacementAssessment).to.be.true;
    });

    it('should return false when the assessment is not a SMART_PLACEMENT', () => {
      // given
      const assessment = Assessment.fromAttributes({ type: 'PLACEMENT' });

      // when
      const isSmartPlacementAssessment = assessment.isSmartPlacementAssessment();

      // then
      expect(isSmartPlacementAssessment).to.be.false;
    });

    it('should return false when the assessment has no type', () => {
      // given
      const assessment = Assessment.fromAttributes({});

      // when
      const isSmartPlacementAssessment = assessment.isSmartPlacementAssessment();

      // then
      expect(isSmartPlacementAssessment).to.be.false;
    });
  });

  describe('#isCertificationAssessment', () => {
    it('should return true when the assessment is a CERTIFICATION', () => {
      // given
      const assessment = Assessment.fromAttributes({ type: 'CERTIFICATION' });

      // when
      const isCertificationAssessment = assessment.isCertificationAssessment();

      // then
      expect(isCertificationAssessment).to.be.true;
    });

    it('should return false when the assessment is not a CERTIFICATION', () => {
      // given
      const assessment = Assessment.fromAttributes({ type: 'PLACEMENT' });

      // when
      const isCertificationAssessment = assessment.isCertificationAssessment();

      // then
      expect(isCertificationAssessment).to.be.false;
    });

    it('should return false when the assessment has no type', () => {
      // given
      const assessment = Assessment.fromAttributes({});

      // when
      const isCertificationAssessment = assessment.isCertificationAssessment();

      // then
      expect(isCertificationAssessment).to.be.false;
    });
  });

  describe('#addAnswersWithTheirChallenge', () => {
    it('should add answers with their challenges at the assessment', () => {
      // given
      const assessment = new Assessment({});
      const answerList = [
        new Answer({ challengeId: 1, value: 'truc' }),
        new Answer({ challengeId: 2, value: 'machin' })
      ];
      const challenge1 = Challenge.fromAttributes();
      challenge1.id = 1;
      const challenge2 = Challenge.fromAttributes();
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
      const ch2 = _newChallenge(skills['@web2']);
      const course = new Course([ch2], competenceSkills);
      course.tubes = [
        _newTube([skills['@web1'], skills['@web2'], skills['@web3']]),
        _newTube([skills['@chi1'], skills['@chi3']]),
        _newTube([skills['@fou3']])
      ];

      course.competenceSkills = competenceSkills;
      const answer2 = _newAnswer(AnswerStatus.KO, ch2);
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
      const ch1 = _newChallenge(skills['@web1']);
      ch1.addSkill(skills['@web2']);
      const ch2 = _newChallenge(skills['@web3']);
      const course = new Course([ch1, ch2], competenceSkills);

      course.tubes = [
        _newTube([skills['@web1'], skills['@web2'], skills['@web3']]),
        _newTube([skills['@chi1'], skills['@chi3']]),
        _newTube([skills['@fou3']]),
        _newTube([skills['@mis3']])
      ];
      course.competenceSkills = competenceSkills;
      const answer1 = _newAnswer(AnswerStatus.OK, ch1);
      const answer2 = _newAnswer(AnswerStatus.KO, ch2);
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
      const ch1 = _newChallenge(skills['@web1']);
      const ch2 = _newChallenge(skills['@web2']);
      const ch3 = _newChallenge(skills['@fou3']);
      const course = new Course([ch1, ch2], competenceSkills);
      course.tubes = [
        _newTube([skills['@web1'], skills['@web2'], skills['@web3']]),
        _newTube([skills['@chi1'], skills['@chi3']]),
        _newTube([skills['@fou3']]),
        _newTube([skills['@mis3']])
      ];
      course.competenceSkills = competenceSkills;
      const answer1 = _newAnswer(AnswerStatus.OK, ch1);
      const answer2 = _newAnswer(AnswerStatus.KO, ch2);
      const answer3 = _newAnswer(AnswerStatus.OK, ch3);

      const assessment = new Assessment();
      assessment.course = course;
      assessment.answers = [answer1, answer2, answer3];

      // when
      const score = assessment.computePixScore();

      // then
      expect(score).to.be.deep.equal(6);
    });

    context('when one challenge was archived', () => {
      it('should return maximum score even if one answer has undefined challenge and skill do not exist anymore', () => {

        // given
        const skillNames = ['@web1', '@web3', '@ch1', '@ch2', '@ch3', '@truc2'];
        const skills = {};
        const competenceSkills = skillNames.map(skillName => skills[skillName] = new Skill({ name: skillName }));
        const web1Challenge = _newChallenge(skills['@web1']);
        const web3Challege = _newChallenge(skills['@web3']);
        const ch1Challenge = _newChallenge(skills['@ch1']);
        const ch2Challenge = _newChallenge(skills['@ch2']);
        ch2Challenge.status = 'archived';
        const ch3Challege = _newChallenge(skills['@ch3']);
        const truc2Challege = _newChallenge(skills['@truc2']);
        const course = new Course([web1Challenge, web3Challege, ch1Challenge, ch2Challenge, ch3Challege, truc2Challege], competenceSkills);
        course.tubes = [
          _newTube([skills['@web1'], skills['@web3']]),
          _newTube([skills['@ch1'], skills['@ch2'], skills['@ch3']]),
          _newTube([skills['@truc2']]),
        ];
        course.competenceSkills = competenceSkills;

        const answer1 = _newAnswer(AnswerStatus.OK, web1Challenge);
        const answer2 = _newAnswer(AnswerStatus.OK, undefined);
        const answer3 = _newAnswer(AnswerStatus.OK, web3Challege);
        const answer4 = _newAnswer(AnswerStatus.OK, ch1Challenge);
        const answer5 = _newAnswer(AnswerStatus.OK, ch2Challenge);
        const answer6 = _newAnswer(AnswerStatus.OK, ch3Challege);
        const answer7 = _newAnswer(AnswerStatus.OK, truc2Challege);
        const assessment = new Assessment();
        assessment.course = course;
        assessment.answers = [answer1, answer2, answer3, answer4, answer5, answer6, answer7];

        // when
        const score = assessment.computePixScore();

        // then
        expect(score).to.be.deep.equal(24);
      });

      it('should return maximum score even if one answer has undefined challenge and but skill exist', () => {

        // given
        const skillNames = ['@web1', '@web2', '@web3', '@ch1', '@ch2', '@ch3'];
        const skills = {};
        const competenceSkills = skillNames.map(skillName => skills[skillName] = new Skill({ name: skillName }));
        const web1Challenge = _newChallenge(skills['@web1']);
        const web2Challenge = _newChallenge(skills['@web2']);
        const web3Challege = _newChallenge(skills['@web3']);
        const ch1Challenge = _newChallenge(skills['@ch1']);
        const ch2Challenge = _newChallenge(skills['@ch2']);
        ch2Challenge.status = 'archived';
        const ch3Challege = _newChallenge(skills['@ch3']);
        const course = new Course([web1Challenge, web2Challenge, web3Challege, ch1Challenge, ch2Challenge, ch3Challege], competenceSkills);
        course.tubes = [
          _newTube([skills['@web1'], skills['@web2'], skills['@web3']]),
          _newTube([skills['@ch1'], skills['@ch2'], skills['@ch3']]),
        ];
        course.competenceSkills = competenceSkills;

        const answer1 = _newAnswer(AnswerStatus.OK, web1Challenge);
        const answer2 = _newAnswer(AnswerStatus.OK, undefined);
        const answer3 = _newAnswer(AnswerStatus.OK, web3Challege);
        const answer4 = _newAnswer(AnswerStatus.OK, ch1Challenge);
        const answer5 = _newAnswer(AnswerStatus.OK, ch2Challenge);
        const answer6 = _newAnswer(AnswerStatus.OK, ch3Challege);
        const assessment = new Assessment();
        assessment.course = course;
        assessment.answers = [answer1, answer2, answer3, answer4, answer5, answer6];

        // when
        const score = assessment.computePixScore();

        // then
        expect(score).to.be.deep.equal(24);
      });
    });
  });

  describe('#getValidatedSkills', function() {

    it('should return [web1, web2] if the user answered correctly a question that requires web2', function() {
      // given
      const skillNames = ['@web1', '@chi1', '@web2', '@web3', '@chi3', '@fou3'];
      const skills = [];
      const competenceSkills = skillNames.map(skillName => skills[skillName] = new Skill({ name: skillName }));
      const ch1 = Challenge.fromAttributes();
      ch1.addSkill(skills['@web3']);
      const ch2 = Challenge.fromAttributes();
      ch2.addSkill(skills['@web2']);
      const course = new Course([ch2], competenceSkills);
      course.tubes = [
        _newTube([skills['@web1'], skills['@web2'], skills['@web3']]),
        _newTube([skills['@chi1'], skills['@chi3']]),
        _newTube([skills['@fou3']])
      ];
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
      const ch1 = Challenge.fromAttributes();
      ch1.addSkill(skills['@web1']);
      const ch2 = Challenge.fromAttributes();
      ch2.addSkill(skills['@web2']);
      const course = new Course([ch2], competenceSkills);
      course.tubes = [
        _newTube([skills['@web1'], skills['@web2'], skills['@web3']]),
        _newTube([skills['@chi1'], skills['@chi3']]),
        _newTube([skills['@fou3']])
      ];

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

  describe('#getFailedSkills', function() {

    it('should return [web1, web2, web3] if the user fails a question that requires web1', function() {
      // given
      const skillNames = ['@web1', '@web2', '@web3'];
      const skills = [];
      const competenceSkills = skillNames.map(skillName => skills[skillName] = new Skill({ name: skillName }));
      const ch1 = Challenge.fromAttributes();
      ch1.addSkill(skills['@web1']);
      const course = new Course([ch1], competenceSkills);
      course.tubes = [_newTube([skills['@web1'], skills['@web2'], skills['@web3']])];
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

  describe('#getAssessedSkills()', function() {

    it('should return empty array when no answers', function() {
      // given
      const assessment = factory.buildAssessement({ answers: [] });

      // when
      const result = assessment.getAssessedSkills();

      // then
      expect(result).to.be.empty;
    });

    it('should return a validated skill and easiers skills when we answered right', function() {
      // given
      // XXX currently tubes are computed from the skills of the challenges,
      // we need a challenge with skill level 1 so that it appears in `assessment.getAssessedSkills()`
      let skillCollection;
      const [s1, s2] = skillCollection = factory.buildSkillCollection({ minLevel: 1, maxLevel: 2 });
      const ch1 = factory.buildChallenge({ skills: [s1] });
      const ch2 = factory.buildChallenge({ skills: [s2] });
      const assessment = factory.buildAssessement({
        course: factory.buildCourse({
          challenges: [ch1, ch2],
          competenceSkills: [s1, s2],
          tubes: [factory.buildTube({ skills: skillCollection })],
        }),
        answers: [factory.buildAnswer({ challengeId: ch2.id, result: AnswerStatus.OK })],
      });

      // when
      assessment.addAnswersWithTheirChallenge(assessment.answers, [ch1, ch2]);
      const result = assessment.getAssessedSkills();

      // then
      expect(result).to.deep.equal([s1, s2]);
    });

    it('should return the union of failed and validated skills', function() {
      // given
      let skillCollection1, skillCollection2;
      const [s1, s2] = skillCollection1 = factory.buildSkillCollection({ minLevel: 1, maxLevel: 2 });
      const [t1, t2, t3] = skillCollection2 = factory.buildSkillCollection({ minLevel: 1, maxLevel: 3 });
      const ch1 = factory.buildChallenge({ skills: [s1] });
      const ch2 = factory.buildChallenge({ skills: [s2] });
      const ch3 = factory.buildChallenge({ skills: [t1] });
      const ch4 = factory.buildChallenge({ skills: [t2] });
      const ch5 = factory.buildChallenge({ skills: [t3] });
      const answerCh2 = factory.buildAnswer({ challengeId: ch2.id, result: AnswerStatus.OK });
      const answerCh4 = factory.buildAnswer({ challengeId: ch4.id, result: AnswerStatus.KO });
      const assessment = factory.buildAssessement({
        course: factory.buildCourse({
          challenges: [ch1, ch2, ch3, ch4, ch5],
          competenceSkills: _.flatten([skillCollection1, skillCollection2]),
          tubes: [
            factory.buildTube({ skills: skillCollection1 }),
            factory.buildTube({ skills: skillCollection2 })
          ],
        }),
        answers: [answerCh2, answerCh4],
      });
      const expectedSkills = [s1, s2, t2, t3];

      // when
      assessment.addAnswersWithTheirChallenge(assessment.answers, [ch1, ch2, ch3, ch4, ch5]);
      const result = assessment.getAssessedSkills();

      // then
      expect(result).to.be.deep.equal(expectedSkills);
    });

    it('should return the union of failed and validated skills without duplications in assessedSkill', function() {
      // given
      let skillCollection1, skillCollection2;
      const [s1, s2] = skillCollection1 = factory.buildSkillCollection({ minLevel: 1, maxLevel: 2 });
      const [t1, t2, t3] = skillCollection2 = factory.buildSkillCollection({ minLevel: 1, maxLevel: 3 });
      const ch1 = factory.buildChallenge({ skills: [s1, s2] });
      const ch2 = factory.buildChallenge({ skills: [s2] });
      const ch3 = factory.buildChallenge({ skills: [t1] });
      const ch4 = factory.buildChallenge({ skills: [t2] });
      const ch5 = factory.buildChallenge({ skills: [t3] });
      const answerCh2 = factory.buildAnswer({ challengeId: ch2.id, result: AnswerStatus.OK });
      const answerCh4 = factory.buildAnswer({ challengeId: ch4.id, result: AnswerStatus.KO });
      const assessment = factory.buildAssessement({
        course: factory.buildCourse({
          challenges: [ch1, ch2, ch3, ch4, ch5],
          competenceSkills: _.flatten([skillCollection1, skillCollection2]),
          tubes: [
            factory.buildTube({ skills: skillCollection1 }),
            factory.buildTube({ skills: skillCollection2 })
          ],
        }),
        answers: [answerCh2, answerCh4],
      });
      const expectedSkills = [s1, s2, t2, t3];

      // when
      assessment.addAnswersWithTheirChallenge(assessment.answers, [ch1, ch2, ch3, ch4, ch5]);
      const result = assessment.getAssessedSkills();

      // then
      expect(result).to.be.deep.equal(expectedSkills);
    });
  });
});
