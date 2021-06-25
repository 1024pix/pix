const { expect, databaseBuilder, mockLearningContent, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const certificationAssessmentRepository = require('../../../../lib/infrastructure/repositories/certification-assessment-repository');
const CertificationAssessment = require('../../../../lib/domain/models/CertificationAssessment');
const Challenge = require('../../../../lib/domain/models/Challenge');
const _ = require('lodash');

describe('Integration | Infrastructure | Repositories | certification-assessment-repository', () => {

  beforeEach(() => {
    const learningContent = {
      areas: [{
        id: 'recArea1',
        titleFrFr: 'area1_Title',
        competenceIds: ['recArea1_Competence1'],
      }],
      competences: [{
        id: 'recArea1_Competence1',
        nameFrFr: 'competence1_1_name',
        index: 'competence1_1_index',
        areaId: 'recArea1',
        skillIds: ['recArea1_Competence1_Tube1_Skill1', 'recArea1_Competence1_Tube1_Skill2'],
      }],
      tubes: [{
        id: 'recArea1_Competence1_Tube1',
        competenceId: 'recArea1_Competence1',
        practicalTitleFrFr: 'tube1_1_1_practicalTitle',
        practicalDescriptionFrFr: 'tube1_1_1_practicalDescription',
      }],
      skills: [{
        id: 'recArea1_Competence1_Tube1_Skill1',
        name: 'skill1_1_1_1_name',
        status: 'actif',
        tubeId: 'recArea1_Competence1_Tube1',
        competenceId: 'recArea1_Competence1',
        tutorialIds: [],
      }, {
        id: 'recArea1_Competence1_Tube1_Skill2',
        name: 'skill1_1_1_2_name',
        status: 'actif',
        tubeId: 'recArea1_Competence1_Tube1',
        competenceId: 'recArea1_Competence1',
        tutorialIds: [],
      }],
      challenges: [{
        id: 'recChalA',
        type: Challenge.Type.QCU,
        status: 'validé',
        skillIds: ['recArea1_Competence1_Tube1_Skill1'],
      }, {
        id: 'recChalB',
        type: Challenge.Type.QCM,
        status: 'archivé',
        skillIds: ['recArea1_Competence1_Tube1_Skill2'],
      }],
    };
    mockLearningContent(learningContent);
  });

  describe('#get', () => {

    let certificationAssessmentId;
    let expectedCertificationCourseId;
    let expectedUserId;
    const expectedState = CertificationAssessment.states.COMPLETED;
    const expectedCreatedAt = new Date('2020-01-01T00:00:00Z');
    const expectedCompletedAt = new Date('2020-01-02T00:00:00Z');

    context('when the certification assessment exists', () => {

      it('should return the certification assessment with certification challenges and answers', async () => {
        // given
        const dbf = databaseBuilder.factory;
        expectedUserId = dbf.buildUser().id;
        expectedCertificationCourseId = dbf.buildCertificationCourse({
          userId: expectedUserId,
          createdAt: expectedCreatedAt,
          completedAt: expectedCompletedAt,
          isV2Certification: true,
        }).id;
        certificationAssessmentId = dbf.buildAssessment({
          userId: expectedUserId,
          certificationCourseId: expectedCertificationCourseId,
          state: expectedState,
        }).id;
        dbf.buildAnswer({ assessmentId: certificationAssessmentId });
        dbf.buildAnswer({ assessmentId: certificationAssessmentId });
        dbf.buildCertificationChallenge({ challengeId: 'recChalA', courseId: expectedCertificationCourseId });
        dbf.buildCertificationChallenge({ challengeId: 'recChalB', courseId: expectedCertificationCourseId });

        await databaseBuilder.commit();

        // when
        const certificationAssessment = await certificationAssessmentRepository.get(certificationAssessmentId);

        // then
        expect(certificationAssessment).to.be.an.instanceOf(CertificationAssessment);
        expect(certificationAssessment.id).to.equal(certificationAssessmentId);
        expect(certificationAssessment.userId).to.equal(expectedUserId);
        expect(certificationAssessment.certificationCourseId).to.equal(expectedCertificationCourseId);
        expect(certificationAssessment.state).to.equal(expectedState);
        expect(certificationAssessment.isV2Certification).to.be.true;

        expect(certificationAssessment.certificationAnswersByDate).to.have.length(2);
        expect(certificationAssessment.listCertificationChallenges()).to.have.length(2);
      });

      it('should sort challenges by index if available', async () => {
        // given
        const dbf = databaseBuilder.factory;
        expectedUserId = dbf.buildUser().id;
        expectedCertificationCourseId = dbf.buildCertificationCourse({
          userId: expectedUserId,
          createdAt: expectedCreatedAt,
          completedAt: expectedCompletedAt,
          isV2Certification: true,
        }).id;
        certificationAssessmentId = dbf.buildAssessment({
          userId: expectedUserId,
          certificationCourseId: expectedCertificationCourseId,
          state: expectedState,
        }).id;
        dbf.buildAnswer({ assessmentId: certificationAssessmentId });
        dbf.buildAnswer({ assessmentId: certificationAssessmentId });
        dbf.buildCertificationChallenge({ challengeId: 'recChalA', courseId: expectedCertificationCourseId, index: 2 });
        dbf.buildCertificationChallenge({ challengeId: 'recChalB', courseId: expectedCertificationCourseId, index: 1 });
        dbf.buildCertificationChallenge({ challengeId: 'recChalC', courseId: expectedCertificationCourseId, index: 3 });

        await databaseBuilder.commit();

        // when
        const certificationAssessment = await certificationAssessmentRepository.get(certificationAssessmentId);

        // then
        const certificationChallenges = certificationAssessment.listCertificationChallenges();
        expect(certificationChallenges[0].challengeId).to.equal('recChalB');
        expect(certificationChallenges[1].challengeId).to.equal('recChalA');
        expect(certificationChallenges[2].challengeId).to.equal('recChalC');
      });

      it('should sort challenges by id if index is not available (= retro-compatibility)', async () => {
        // given
        const dbf = databaseBuilder.factory;
        expectedUserId = dbf.buildUser().id;
        expectedCertificationCourseId = dbf.buildCertificationCourse({
          userId: expectedUserId,
          createdAt: expectedCreatedAt,
          completedAt: expectedCompletedAt,
          isV2Certification: true,
        }).id;
        certificationAssessmentId = dbf.buildAssessment({
          userId: expectedUserId,
          certificationCourseId: expectedCertificationCourseId,
          state: expectedState,
        }).id;
        dbf.buildAnswer({ assessmentId: certificationAssessmentId });
        dbf.buildAnswer({ assessmentId: certificationAssessmentId });
        const firstChallengeByInsertionOrder = dbf.buildCertificationChallenge({ challengeId: 'recChalB', courseId: expectedCertificationCourseId });
        const secondChallengeByInsertionOrder = dbf.buildCertificationChallenge({ challengeId: 'recChalA', courseId: expectedCertificationCourseId });
        const thirdChallengeByInsertionOrder = dbf.buildCertificationChallenge({ challengeId: 'recChalC', courseId: expectedCertificationCourseId });

        await databaseBuilder.commit();

        // when
        const certificationAssessment = await certificationAssessmentRepository.get(certificationAssessmentId);

        // then
        const certificationChallenges = certificationAssessment.listCertificationChallenges();
        expect(certificationChallenges[0].challengeId).to.equal(firstChallengeByInsertionOrder.challengeId);
        expect(certificationChallenges[1].challengeId).to.equal(secondChallengeByInsertionOrder.challengeId);
        expect(certificationChallenges[2].challengeId).to.equal(thirdChallengeByInsertionOrder.challengeId);
      });
    });

    context('when the assessment does not exist', () => {
      it('should throw a NotFoundError', async () => {
        // when
        const error = await catchErr(certificationAssessmentRepository.get)(12345);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#getByCertificationCourseId', () => {

    let expectedCertificationAssessmentId;
    let certificationCourseId;
    let expectedUserId;
    const expectedState = CertificationAssessment.states.COMPLETED;
    const expectedCreatedAt = new Date('2020-01-01T00:00:00Z');
    const expectedCompletedAt = new Date('2020-01-02T00:00:00Z');

    context('when the certification assessment exists', () => {
      let firstAnswerInTime;
      let secondAnswerInTime;

      beforeEach(() => {
        const dbf = databaseBuilder.factory;
        expectedUserId = dbf.buildUser().id;
        certificationCourseId = dbf.buildCertificationCourse({
          userId: expectedUserId,
          createdAt: expectedCreatedAt,
          completedAt: expectedCompletedAt,
          isV2Certification: true,
        }).id;
        expectedCertificationAssessmentId = dbf.buildAssessment({
          userId: expectedUserId,
          certificationCourseId: certificationCourseId,
          state: expectedState,
        }).id;

        // secondAnswerInTime must be inserted in DB before firstAnswerInTime so we can ensure that ordering is based on createdAt
        secondAnswerInTime = dbf.buildAnswer({
          assessmentId: expectedCertificationAssessmentId,
          createdAt: new Date('2020-06-24T00:00:01Z'),
        }).id;

        firstAnswerInTime = dbf.buildAnswer({
          assessmentId: expectedCertificationAssessmentId,
          createdAt: new Date('2020-06-24T00:00:00Z'),
        }).id;

        dbf.buildCertificationChallenge({ challengeId: 'recChalA', courseId: certificationCourseId, id: 123 });
        dbf.buildCertificationChallenge({ challengeId: 'recChalB', courseId: certificationCourseId, id: 456 });

        return databaseBuilder.commit();
      });

      it('should return the certification assessment with certification challenges and answers', async () => {
        // when
        const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId });

        // then
        expect(certificationAssessment).to.be.an.instanceOf(CertificationAssessment);
        expect(certificationAssessment.id).to.equal(expectedCertificationAssessmentId);
        expect(certificationAssessment.userId).to.equal(expectedUserId);
        expect(certificationAssessment.certificationCourseId).to.equal(certificationCourseId);
        expect(certificationAssessment.state).to.equal(expectedState);
        expect(certificationAssessment.isV2Certification).to.be.true;

        expect(certificationAssessment.certificationAnswersByDate).to.have.length(2);
        expect(certificationAssessment.listCertificationChallenges()).to.have.length(2);
      });

      it('should return the certification answers ordered by date', async () => {
        // when
        const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId });

        // then
        expect(_.map(certificationAssessment.certificationAnswersByDate, 'id')).to.deep.equal([firstAnswerInTime, secondAnswerInTime]);
      });

      it('should return the certification challenges ordered by id', async () => {
        // when
        const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId });

        // then
        expect(_.map(certificationAssessment.listCertificationChallenges(), 'challengeId')).to.deep.equal(['recChalA', 'recChalB']);
        expect(_.map(certificationAssessment.listCertificationChallenges(), 'type')).to.deep.equal([Challenge.Type.QCU, Challenge.Type.QCM]);
      });
    });

    context('when the assessment does not exist', () => {
      it('should throw a NotFoundError', async () => {
        // when
        const error = await catchErr(certificationAssessmentRepository.getByCertificationCourseId)({ certificationCourseId: 12345 });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#save', () => {

    it('persists the mutation of neutralized certification challenges', async () => {
      // given
      const dbf = databaseBuilder.factory;
      const userId = dbf.buildUser().id;
      const certificationCourseId = dbf.buildCertificationCourse({ userId }).id;
      const certificationAssessmentId = dbf.buildAssessment({
        userId,
        certificationCourseId,
      }).id;
      dbf.buildAnswer({ assessmentId: certificationAssessmentId });
      dbf.buildAnswer({ assessmentId: certificationAssessmentId });

      const certificationChallenge1RecId = 'rec1234';
      const certificationChallenge2RecId = 'rec567' ;
      dbf.buildCertificationChallenge({ challengeId: certificationChallenge1RecId, courseId: certificationCourseId, isNeutralized: false });
      dbf.buildCertificationChallenge({ challengeId: certificationChallenge2RecId, courseId: certificationCourseId, isNeutralized: false });
      dbf.buildCertificationChallenge({ challengeId: 'rec8910', courseId: certificationCourseId, isNeutralized: false });

      await databaseBuilder.commit();
      const certificationAssessmentToBeSaved = await certificationAssessmentRepository.get(certificationAssessmentId);

      // when
      certificationAssessmentToBeSaved.neutralizeChallengeByRecId(certificationChallenge1RecId);
      certificationAssessmentToBeSaved.neutralizeChallengeByRecId(certificationChallenge2RecId);
      await certificationAssessmentRepository.save(certificationAssessmentToBeSaved);

      // then
      const persistedCertificationAssessment = await certificationAssessmentRepository.get(certificationAssessmentId);
      const persistedCertificationChallenges = persistedCertificationAssessment.listCertificationChallenges();
      expect(persistedCertificationChallenges[0].isNeutralized).to.be.true;
      expect(persistedCertificationChallenges[1].isNeutralized).to.be.true;
      expect(persistedCertificationChallenges[2].isNeutralized).to.be.false;
    });
  });
});
