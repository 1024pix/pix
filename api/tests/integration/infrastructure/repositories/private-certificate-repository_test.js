const { expect, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const privateCertificateRepository = require('../../../../lib/infrastructure/repositories/private-certificate-repository');
const PrivateCertificate = require('../../../../lib/domain/models/PrivateCertificate');

describe('Integration | Infrastructure | Repository | Private Certificate', () => {

  describe('#get', () => {

    it('should throw a NotFoundError when private certificate does not exist', async () => {
      // when
      const error = await catchErr(privateCertificateRepository.get)(123);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('Certificate not found for ID 123');
    });

    it('should return a PrivateCertificate', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'ABCDE-F',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        commentForCandidate: 'Il aime beaucoup les mangues, et ça se voit !',
        cleaCertificationStatus: null,
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificateId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: privateCertificateData.isPublished,
        isCancelled: false,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: privateCertificateData.pixScore,
        status: 'validated',
        commentForCandidate: privateCertificateData.commentForCandidate,
      });
      await databaseBuilder.commit();

      // when
      const privateCertificate = await privateCertificateRepository.get(certificateId);

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
        id: certificateId,
        ...privateCertificateData,
      });
      expect(privateCertificate).to.be.instanceOf(PrivateCertificate);
      expect(privateCertificate).to.deep.equal(expectedPrivateCertificate);
    });

    it('should build from the latest assessment result if any', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'ABCDE-F',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        commentForCandidate: 'Il aime beaucoup les mangues, et ça se voit !',
        cleaCertificationStatus: null,
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificateId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: privateCertificateData.isPublished,
        isCancelled: false,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId }).id;
      databaseBuilder.factory.buildAssessmentResult({
        createdAt: new Date('2021-03-01'),
        assessmentId,
        pixScore: privateCertificateData.pixScore,
        status: 'rejected',
        commentForCandidate: privateCertificateData.commentForCandidate,
      });
      databaseBuilder.factory.buildAssessmentResult({
        createdAt: new Date('2021-01-01'),
        assessmentId,
        pixScore: privateCertificateData.pixScore,
        status: 'validated',
        commentForCandidate: privateCertificateData.commentForCandidate,
      });
      await databaseBuilder.commit();

      // when
      const privateCertificate = await privateCertificateRepository.get(certificateId);

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.rejected({
        id: certificateId,
        ...privateCertificateData,
      });
      expect(privateCertificate).to.deep.equal(expectedPrivateCertificate);
    });

    it('should build even if there is not assessment result', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'ABCDE-F',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: null,
        commentForCandidate: null,
        cleaCertificationStatus: null,
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificateId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: privateCertificateData.isPublished,
        isCancelled: false,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId });
      await databaseBuilder.commit();

      // when
      const privateCertificate = await privateCertificateRepository.get(certificateId);

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.started({
        id: certificateId,
        ...privateCertificateData,
      });
      expectedPrivateCertificate.pixScore = null;
      expectedPrivateCertificate.commentForCandidate = null;
      expect(privateCertificate).to.deep.equal(expectedPrivateCertificate);
    });
  });
});
