const { expect, databaseBuilder, mockLearningContent, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const certificationAssessmentRepository = require('../../../../lib/infrastructure/repositories/certification-assessment-repository');
const CertificationAssessment = require('../../../../lib/domain/models/CertificationAssessment');
const Challenge = require('../../../../lib/domain/models/Challenge');
const _ = require('lodash');

describe('Integration | Infrastructure | Repositories | certification-assessment-repository', function() {

  beforeEach(function() {
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

  describe('#get', function() {

    let certificationAssessmentId;
    let expectedCertificationCourseId;
    let expectedUserId;
    let expectedState;
    let expectedCreatedAt;
    let expectedCompletedAt;

    context('when the certification assessment exists', function() {

      beforeEach(function() {
        expectedState = CertificationAssessment.states.COMPLETED;
        expectedCreatedAt = new Date('2020-01-01T00:00:00Z');
        expectedCompletedAt = new Date('2020-01-02T00:00:00Z');

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
        dbf.buildAnswer({ assessmentId: certificationAssessmentId, challengeId: 'recChalA' });
        dbf.buildAnswer({ assessmentId: certificationAssessmentId, challengeId: 'recChalB' });
        dbf.buildAnswer({ assessmentId: certificationAssessmentId, challengeId: 'recChalB' });
        dbf.buildCertificationChallenge({ challengeId: 'recChalA', courseId: expectedCertificationCourseId, isNeutralized: true });
        dbf.buildCertificationChallenge({ challengeId: 'recChalB', courseId: expectedCertificationCourseId });

        return databaseBuilder.commit();
      });

      it('should return the certification assessment with certification challenges and answers', async function() {
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
        expect(certificationAssessment.certificationChallenges).to.have.length(2);
        expect(certificationAssessment.certificationChallenges[0].isNeutralized).to.be.true;
        expect(certificationAssessment.certificationChallenges[0].type).to.equal(Challenge.Type.QCU);
      });
    });

    context('when the assessment does not exist', function() {
      it('should throw a NotFoundError', async function() {
        // when
        const error = await catchErr(certificationAssessmentRepository.get)(12345);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#getByCertificationCourseId', function() {

    let expectedCertificationAssessmentId;
    let certificationCourseId;
    let expectedUserId;
    let expectedState;
    let expectedCreatedAt;
    let expectedCompletedAt;

    context('when the certification assessment exists', function() {
      let firstAnswerInTime;
      let secondAnswerInTime;

      beforeEach(function() {
        expectedState = CertificationAssessment.states.COMPLETED;
        expectedCreatedAt = new Date('2020-01-01T00:00:00Z');
        expectedCompletedAt = new Date('2020-01-02T00:00:00Z');

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
          challengeId: 'recChalA',
        }).id;

        firstAnswerInTime = dbf.buildAnswer({
          assessmentId: expectedCertificationAssessmentId,
          createdAt: new Date('2020-06-24T00:00:00Z'),
          challengeId: 'recChalB',
        }).id;

        dbf.buildAnswer({
          assessmentId: expectedCertificationAssessmentId,
          createdAt: new Date('2020-06-25T00:00:01Z'),
          challengeId: 'recChalA',
        }).id;
        dbf.buildCertificationChallenge({ challengeId: 'recChalA', courseId: certificationCourseId, id: 123 });
        dbf.buildCertificationChallenge({ challengeId: 'recChalB', courseId: certificationCourseId, id: 456 });

        return databaseBuilder.commit();
      });

      it('should return the certification assessment with certification challenges and answers', async function() {
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
        expect(certificationAssessment.certificationChallenges).to.have.length(2);
      });

      it('should return the certification answers ordered by date', async function() {
        // when
        const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId });

        // then
        expect(_.map(certificationAssessment.certificationAnswersByDate, 'id')).to.deep.equal([firstAnswerInTime, secondAnswerInTime]);
      });

      it('should return the certification challenges ordered by id', async function() {
        // when
        const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId });

        // then
        expect(_.map(certificationAssessment.certificationChallenges, 'challengeId')).to.deep.equal(['recChalA', 'recChalB']);
        expect(_.map(certificationAssessment.certificationChallenges, 'type')).to.deep.equal([Challenge.Type.QCU, Challenge.Type.QCM]);
      });
    });

    context('when the assessment does not exist', function() {
      it('should throw a NotFoundError', async function() {
        // when
        const error = await catchErr(certificationAssessmentRepository.getByCertificationCourseId)({ certificationCourseId: 12345 });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#save', function() {

    it('persists the mutation of neutralized certification challenges', async function() {
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
      expect(persistedCertificationAssessment.certificationChallenges[0].isNeutralized).to.be.true;
      expect(persistedCertificationAssessment.certificationChallenges[1].isNeutralized).to.be.true;
      expect(persistedCertificationAssessment.certificationChallenges[2].isNeutralized).to.be.false;
    });
  });
});
