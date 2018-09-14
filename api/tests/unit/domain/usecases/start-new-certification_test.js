const faker = require('faker');
const { expect, sinon, factory } = require('../../../test-helper');
const errors = require('../../../../lib/domain/errors');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');
const usecases = require('../../../../lib/domain/usecases');

function buildAValidAssessment() {

  return factory.buildAssessment({
    type: Assessment.types.PLACEMENT,
    state: Assessment.states.COMPLETED,
    assessmentResults: [factory.buildAssessmentResult({ level: 3 })],
    answers: [
      factory.buildAnswer({ result: AnswerStatus.OK }),
      factory.buildAnswer({ result: AnswerStatus.OK }),
      factory.buildAnswer({ result: AnswerStatus.KO }),
      factory.buildAnswer({ result: AnswerStatus.OK }),
      factory.buildAnswer({ result: AnswerStatus.SKIPPED }),
      factory.buildAnswer({ result: AnswerStatus.OK }),
    ],
  });
}

function buildAValidAssessmentDataSet() {

  function buildChallengeSet({ skills, competenceId }) {
    return [
      factory.buildChallenge({ skills, competenceId }),
      factory.buildChallenge({ skills, competenceId }),
      factory.buildChallenge({ skills, competenceId }),
    ];
  }

  const assessmentId = faker.random.number();
  const competenceId = faker.random.number();

  const skillCollections = [
    factory.buildSkillCollection({ minLevel: 1, maxLevel: 5 }),
    factory.buildSkillCollection({ minLevel: 1, maxLevel: 5 }),
    factory.buildSkillCollection({ minLevel: 1, maxLevel: 5 }),
    factory.buildSkillCollection({ minLevel: 1, maxLevel: 5 }),
    factory.buildSkillCollection({ minLevel: 1, maxLevel: 5 }),
    factory.buildSkillCollection({ minLevel: 1, maxLevel: 5 }),
  ];
  const challengeSets = [
    buildChallengeSet({ skills: [skillCollections[0][1]], competenceId }),
    buildChallengeSet({ skills: [skillCollections[1][1]], competenceId }),
    buildChallengeSet({ skills: [skillCollections[2][1]], competenceId }),
    buildChallengeSet({ skills: [skillCollections[3][1]], competenceId }),
    buildChallengeSet({ skills: [skillCollections[4][0]], competenceId }),
    buildChallengeSet({ skills: [skillCollections[5][0]], competenceId }),
  ];
  const challenges = [].concat(...challengeSets);

  const assessment = factory.buildAssessment({
    id: assessmentId,
    type: Assessment.types.PLACEMENT,
    state: Assessment.states.COMPLETED,
    assessmentResults: [factory.buildAssessmentResult({ level: 3 })],
    answers: [
      factory.buildAnswer({ assessmentId, challengeId: challengeSets[0][0].id, result: AnswerStatus.OK }),
      factory.buildAnswer({ assessmentId, challengeId: challengeSets[1][0].id, result: AnswerStatus.OK }),
      factory.buildAnswer({ assessmentId, challengeId: challengeSets[2][0].id, result: AnswerStatus.KO }),
      factory.buildAnswer({ assessmentId, challengeId: challengeSets[3][0].id, result: AnswerStatus.OK }),
      factory.buildAnswer({ assessmentId, challengeId: challengeSets[4][0].id, result: AnswerStatus.SKIPPED }),
      factory.buildAnswer({ assessmentId, challengeId: challengeSets[5][0].id, result: AnswerStatus.OK }),
    ],
  });

  return {
    assessment,
    challenges,
  };
}

describe('Unit | UseCase | StartNewCertification', () => {

  const assessmentRepository = Object.seal({
    findLastCompletedAssessmentsForEachCoursesByUser: () => undefined,
  });
  const certificationChallengeRepository = Object.seal({
    save: () => undefined,
  });
  const certificationCourseRepository = Object.seal({
    save: () => undefined,
  });
  const challengeRepository = Object.seal({
    list: () => undefined,
  });

  beforeEach(() => {
    assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser = sinon.stub();
    certificationChallengeRepository.save = sinon.stub();
    certificationCourseRepository.save = sinon.stub();
    challengeRepository.list = sinon.stub();
  });

  context('when user has less than 5 placement assessments with level higher than 0', () => {

    let assessments;
    let promise;
    const userId = 5;
    const sessionId = 505;
    const isoStringOfCertificationCreationDate = '2011-10-05T14:48:00.000Z';

    beforeEach(() => {
      // given
      const finishedAndValidAssessment1 = buildAValidAssessment();
      const finishedAndValidAssessment2 = buildAValidAssessment();
      const finishedAndValidAssessment3 = buildAValidAssessment();
      const finishedAndValidAssessment4 = buildAValidAssessment();
      const finishedAssessmentWithLevelAt0 = factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
        state: Assessment.states.COMPLETED,
        assessmentResults: [factory.buildAssessmentResult({ level: 0 })],
      });

      assessments = [
        finishedAndValidAssessment1,
        finishedAndValidAssessment2,
        finishedAndValidAssessment3,
        finishedAndValidAssessment4,
        finishedAssessmentWithLevelAt0,
      ];
      assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser.resolves(assessments);

      // when
      promise = usecases.startNewCertification({
        userId,
        sessionId,
        isoStringOfCertificationCreationDate,
        assessmentRepository,
        certificationCourseRepository,
        certificationChallengeRepository,
        challengeRepository,
      });
    });

    it('should fail', () => {
      // then
      return expect(promise).to.be.rejectedWith(errors.UserNotAuthorizedToCertifyError);
    });
    it('should get user’s last completed assessments', () => {
      return promise.catch(() => {
        expect(assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser)
          .to.have.been.calledWithExactly(userId, isoStringOfCertificationCreationDate);
      });
    });
  });

  context('when user has at least 5 placement assessments with level higher than 0', () => {

    context('when at least one of the assessment has a level higher than 0' +
            ' but with less than 3 correct answers', () => {

      let assessments;
      let promise;
      const userId = 5;
      const sessionId = 505;
      const isoStringOfCertificationCreationDate = '2011-10-05T14:48:00.000Z';

      beforeEach(() => {
        // given
        const finishedAndValidAssessment1 = buildAValidAssessment();
        const finishedAndValidAssessment2 = buildAValidAssessment();
        const finishedAndValidAssessment3 = buildAValidAssessment();
        const finishedAndValidAssessment4 = buildAValidAssessment();
        const assessmentWithOnly2ValidAnswers = factory.buildAssessment({
          type: Assessment.types.PLACEMENT,
          state: Assessment.states.COMPLETED,
          assessmentResults: [factory.buildAssessmentResult({ level: 3 })],
          answers: [
            factory.buildAnswer({ result: AnswerStatus.OK }),
            factory.buildAnswer({ result: AnswerStatus.OK }),
            factory.buildAnswer({ result: AnswerStatus.KO }),
            factory.buildAnswer({ result: AnswerStatus.KO }),
          ],
        });

        assessments = [
          finishedAndValidAssessment1,
          finishedAndValidAssessment2,
          finishedAndValidAssessment3,
          finishedAndValidAssessment4,
          assessmentWithOnly2ValidAnswers,
        ];
        assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser.resolves(assessments);

        // when
        promise = usecases.startNewCertification({
          userId,
          sessionId,
          isoStringOfCertificationCreationDate,
          assessmentRepository,
          certificationCourseRepository,
          certificationChallengeRepository,
          challengeRepository,
        });
      });

      it('should fail', () => {
        return expect(promise).to.be.rejectedWith(errors.CertificationComputeError);
      });
      it('should get user’s last completed assessments', () => {
        return promise.catch(() => {
          expect(assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser)
            .to.have.been.calledWithExactly(userId, isoStringOfCertificationCreationDate);
        });
      });
    });

    context('when none of the assessments have a level higher than 0 with less than 3 correct answers', () => {

      let assessments;
      let challenges;
      let promise;
      const userId = 5;
      const savedCertificationCourseId = 987;
      const sessionId = 505;
      const isoStringOfCertificationCreationDate = '2011-10-05T14:48:00.000Z';

      beforeEach(() => {
        // given
        const validDataSet1 = buildAValidAssessmentDataSet();
        const validDataSet2 = buildAValidAssessmentDataSet();
        const validDataSet3 = buildAValidAssessmentDataSet();
        const validDataSet4 = buildAValidAssessmentDataSet();
        const validDataSet5 = buildAValidAssessmentDataSet();

        assessments = [
          validDataSet1.assessment,
          validDataSet2.assessment,
          validDataSet3.assessment,
          validDataSet4.assessment,
          validDataSet5.assessment,
        ];
        assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser.resolves(assessments);

        challenges = [].concat(...[
          validDataSet1.challenges,
          validDataSet2.challenges,
          validDataSet3.challenges,
          validDataSet4.challenges,
          validDataSet5.challenges,
        ]);
        challengeRepository.list.resolves(challenges);

        // TODO: add nb of certificationChallenges ?
        const savedCertificationCourse = new CertificationCourse({
          id: savedCertificationCourseId,
          sessionId,
          userId,
        });
        certificationCourseRepository.save.resolves(savedCertificationCourse);

        // when
        promise = usecases.startNewCertification({
          userId,
          sessionId,
          isoStringOfCertificationCreationDate,
          assessmentRepository,
          certificationCourseRepository,
          certificationChallengeRepository,
          challengeRepository,
        });
      });

      it('should succeed', () => {
        return expect(promise).to.be.fulfilled;
      });
      it('should get user’s last completed assessments', () => {
        return promise.then(() => {
          expect(assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser)
            .to.have.been.calledWithExactly(userId, isoStringOfCertificationCreationDate);
        });
      });
      it('should load all challenges', () => {
        return promise.then(() => {
          expect(challengeRepository.list).to.have.been.called;
        });
      });
      it('should create a certification course with userId, session Id', () => {
        const expectedCertificationCourse = new CertificationCourse({
          userId,
          sessionId,
        });

        return promise.then(() => {
          expect(certificationCourseRepository.save).to.have.been.called;

          const argument = certificationCourseRepository.save.args[0][0];
          expect(argument).to.be.an.instanceOf(CertificationCourse);
          expect(argument).to.deep.equal(expectedCertificationCourse);
        });
      });
      it('should return a certification course with userId, session Id and a numberOfChallenges', () => {
        const expectedCertificationCourse = new CertificationCourse({
          id: savedCertificationCourseId,
          userId,
          sessionId,
          nbChallenges: (assessments.length * 3),
        });

        return promise.then((certificationCourse) => {
          expect(certificationCourse).to.be.an.instanceOf(CertificationCourse);
          expect(certificationCourse).to.deep.equal(expectedCertificationCourse);
        });
      });
      it('should select and save three challenges per competences where the user has been successfully placed', () => {

        return promise.then(() => {
          expect(certificationChallengeRepository.save.callCount).to.equal(assessments.length * 3);
        });
      });
      it('should select and save three challenges, not already done by user, ' +
         'validating skills of the highest level', () => {

        return promise.then(() => {
        });
      });
      it('should select and save three challenges, with some already done by user,' +
         ' and validating skills of the highest level if no other challenges are available for those skills', () => {

      });
      it('should select and save challenges validating skills of a level under the highest level ' +
         'if not enough challenges validating skills of the highest level are available', () => {

      });
    });
  });
});

