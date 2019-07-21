const { expect, knex, domainBuilder, databaseBuilder } = require('../../../test-helper');
const _ = require('lodash');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certification-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');

const Certification = require('../../../../lib/domain/models/Certification');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Integration | Repository | Certification ', () => {

  describe('#getCertification', () => {

    let certificationCourse, certificationCourseWithoutDate;
    let user, certificationCenter, assessment, assessmentResult;
    beforeEach(async () => {
      user = databaseBuilder.factory.buildUser({});
      certificationCenter = databaseBuilder.factory.buildCertificationCenter({});
      const firstSession = databaseBuilder.factory.buildSession(
        {
          certificationCenter: certificationCenter.name,
          certificationCenterId: certificationCenter.id,
        });
      const secondSession = databaseBuilder.factory.buildSession(
        {
          certificationCenter: certificationCenter.name,
          certificationCenterId: certificationCenter.id,
        });
      certificationCourse = databaseBuilder.factory.buildCertificationCourse(
        {
          userId: user.id,
          completedAt: new Date('2000-02-12T01:02:03Z'),
          sessionId: firstSession.id,
          isPublished: true,
        });
      certificationCourseWithoutDate = databaseBuilder.factory.buildCertificationCourse(
        {
          userId: user.id,
          completedAt: null,
          birthdate: null,
          sessionId: secondSession.id,
          isPublished: true,
        });
      assessment = databaseBuilder.factory.buildAssessment(
        {
          courseId: certificationCourse.id,
          userId: user.id,
          type: Assessment.types.CERTIFICATION,
          state: 'completed',
        });
      const assessmentWithoutDate = databaseBuilder.factory.buildAssessment(
        {
          courseId: certificationCourseWithoutDate.id,
          userId: user.id,
          type: Assessment.types.CERTIFICATION,
          state: 'completed',
        });
      assessmentResult = databaseBuilder.factory.buildAssessmentResult(
        {
          level: 1,
          pixScore: 23,
          emitter: 'PIX-ALGO',
          status: 'rejected',
          assessmentId: assessment.id,
          commentForCandidate: 'Comment for candidate',
        });
      databaseBuilder.factory.buildAssessmentResult(
        {
          level: 1,
          pixScore: 42,
          emitter: 'PIX-ALGO',
          status: 'rejected',
          assessmentId: assessmentWithoutDate.id,
          commentForCandidate: 'Comment for candidate',
        });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return a certification with needed informations', () => {
      // given
      const expectedCertification = domainBuilder.buildCertification(
        {
          userId: user.id,
          certificationCenter: certificationCenter.name,
          date: certificationCourse.completedAt,
          isPublished: true,
          assessmentState: assessment.state,
          birthdate: certificationCourse.birthdate,
          birthplace: certificationCourse.birthplace,
          firstName: certificationCourse.firstName,
          lastName: certificationCourse.lastName,
          pixScore: assessmentResult.pixScore,
          status: assessmentResult.status,
          commentForCandidate: assessmentResult.commentForCandidate,
          certifiedProfile: null,
        });

      // when
      const promise = certificationRepository.getCertification({ id: certificationCourse.id });

      // then
      return promise.then((certification) => {
        expect(_.omit(certification, ['date', 'birthdate', 'id'])).to.deep.equal(_.omit(expectedCertification, ['date', 'birthdate', 'id']));
      });
    });

    it('should not return a false birthdate or completedAt date if there are null in database', () => {
      // when
      const promise = certificationRepository.getCertification({ id: certificationCourseWithoutDate.id });

      // then
      return promise.then((certification) => {
        expect(certification.date).to.be.null;
        expect(certification.birthdate).to.be.null;
      });
    });

    it('should return a not found error when certification does not exist', () => {
      // when
      const promise = certificationRepository.getCertification({ id: -1 });

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });
  });

  describe('#findCertificationbyUserId', () => {

    let user, certificationCourse, certificationCenter, assessment, assessmentResult;
    beforeEach(async () => {
      user = databaseBuilder.factory.buildUser({});
      certificationCenter = databaseBuilder.factory.buildCertificationCenter({});
      const session = databaseBuilder.factory.buildSession(
        {
          certificationCenter: certificationCenter.name,
          certificationCenterId: certificationCenter.id,
        });
      certificationCourse = databaseBuilder.factory.buildCertificationCourse(
        {
          userId: user.id,
          completedAt: new Date('2000-02-12T01:02:03Z'),
          sessionId: session.id,
          isPublished: true,
        });
      assessment = databaseBuilder.factory.buildAssessment(
        {
          courseId: certificationCourse.id,
          userId: user.id,
          type: Assessment.types.CERTIFICATION,
          state: 'completed',
        });
      assessmentResult = databaseBuilder.factory.buildAssessmentResult(
        {
          level: 1,
          pixScore: 23,
          emitter: 'PIX-ALGO',
          status: 'rejected',
          assessmentId: assessment.id,
          commentForCandidate: 'Comment for candidate',
        });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return an array of Certification with needed informations', async () => {
      // given
      const expectedCertification = domainBuilder.buildCertification({
        userId: user.id,
        certificationCenter: certificationCenter.name,
        date: certificationCourse.completedAt,
        isPublished: true,
        assessmentState: assessment.state,
        // TODO : Handle date type correctly
        birthdate: certificationCourse.birthdate,
        birthplace: certificationCourse.birthplace,
        firstName: certificationCourse.firstName,
        lastName: certificationCourse.lastName,
        pixScore: assessmentResult.pixScore,
        status: assessmentResult.status,
        commentForCandidate: assessmentResult.commentForCandidate,
        certifiedProfile: null,
      });

      // when
      const certifications = await certificationRepository.findCertificationsByUserId(user.id);

      // then
      expect(certifications).to.have.length(1);

      // TODO : Handle date type correctly
      // TODO : Handle bigint type correctly
      expect(_.omit(certifications[0], ['birthdate', 'id'])).to.deep.equal(_.omit(expectedCertification, ['birthdate', 'id']));
      expect(certifications[0]['birthdate'].toLocaleDateString()).to.equal(expectedCertification['birthdate'].toLocaleDateString());
    });
  });

  describe('#updateCertification', () => {

    let user, certificationCourse, certificationCenter, assessment, assessmentResult;
    beforeEach(async () => {
      user = databaseBuilder.factory.buildUser({});
      certificationCenter = databaseBuilder.factory.buildCertificationCenter({});
      const session = databaseBuilder.factory.buildSession(
        {
          certificationCenter: certificationCenter.name,
          certificationCenterId: certificationCenter.id,
        });
      certificationCourse = databaseBuilder.factory.buildCertificationCourse(
        {
          userId: user.id,
          completedAt: new Date('2000-02-12T01:02:03Z'),
          sessionId: session.id,
          isPublished: false,
        });
      assessment = databaseBuilder.factory.buildAssessment(
        {
          courseId: certificationCourse.id,
          userId: user.id,
          type: Assessment.types.CERTIFICATION,
          state: 'completed',
        });
      assessmentResult = databaseBuilder.factory.buildAssessmentResult(
        {
          level: 1,
          pixScore: 23,
          emitter: 'PIX-ALGO',
          status: 'rejected',
          assessmentId: assessment.id,
          commentForCandidate: 'Comment for candidate',
        });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    context('the certification does not exist', () => {

      it('should return a NotFoundError', () => {
        // given
        const NON_EXISITNG_CERTIFICATION_ID = certificationCourse.id + 1;

        // when
        const promise = certificationRepository.updateCertification({
          id: NON_EXISITNG_CERTIFICATION_ID,
          attributes: { isPublished: true },
        });

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError)
          .then(() => knex('certification-courses').where('id', NON_EXISITNG_CERTIFICATION_ID))
          .then((foundCertifications) => expect(foundCertifications).to.be.empty);
      });
    });

    context('the certification does exist', () => {

      let promise;

      beforeEach(() => {
        promise = certificationRepository.updateCertification({
          id: certificationCourse.id,
          attributes: { isPublished: true },
        });
      });

      // then
      it('should update the certification', () => {

        return promise
          .then(() => knex('certification-courses').where('id', certificationCourse.id))
          .then((foundCertifications) => expect(foundCertifications[0].isPublished).to.be.true);
      });

      it('should return the updated certification', () => {

        const expectedCertification = domainBuilder.buildCertification({
          userId: user.id,
          certificationCenter: certificationCenter.name,
          date: certificationCourse.completedAt,
          isPublished: true,
          assessmentState: assessment.state,
          birthdate: certificationCourse.birthdate,
          birthplace: certificationCourse.birthplace,
          firstName: certificationCourse.firstName,
          lastName: certificationCourse.lastName,
          pixScore: assessmentResult.pixScore,
          status: assessmentResult.status,
          commentForCandidate: assessmentResult.commentForCandidate,
          certifiedProfile: null,
        });

        return promise
          .then((certification) => {
            expect(certification).to.be.an.instanceOf(Certification);
            expect(_.omit(certification, ['birthdate', 'id'])).to.deep.equal(_.omit(expectedCertification, ['birthdate', 'id']));
            expect(certification['birthdate'].toLocaleDateString()).to.equal(expectedCertification['birthdate'].toLocaleDateString());
          });
      });
    });
  });
});
