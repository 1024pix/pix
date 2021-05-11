const { expect, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const CertificationAttestation = require('../../../../lib/domain/models/CertificationAttestation');
const { badgeKey: cleaBadgeKey } = require('../../../../lib/domain/models/CleaCertificationResult');
const certificationAttestationRepository = require('../../../../lib/infrastructure/repositories/certification-attestation-repository');

describe('Integration | Infrastructure | Repository | Certification Attestation', () => {

  describe('#get', () => {

    it('should throw a NotFoundError when certification attestation does not exist', async () => {
      // when
      const error = await catchErr(certificationAttestationRepository.get)(123);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should throw a NotFoundError when certification has no assessment-result', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
        certificationCenterId,
      }).id;
      databaseBuilder.factory.buildCertificationCourse({
        id: certificationAttestationData.id,
        firstName: certificationAttestationData.firstName,
        lastName: certificationAttestationData.lastName,
        birthdate: certificationAttestationData.birthdate,
        birthplace: certificationAttestationData.birthplace,
        isPublished: certificationAttestationData.isPublished,
        isCancelled: false,
        createdAt: certificationAttestationData.date,
        verificationCode: certificationAttestationData.verificationCode,
        maxReachableLevelOnCertificationDate: certificationAttestationData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationAttestationData.id }).id;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificationAttestationRepository.get)(certificationAttestationData.id);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should throw a NotFoundError when certification is cancelled', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
        certificationCenterId,
      }).id;
      databaseBuilder.factory.buildCertificationCourse({
        id: certificationAttestationData.id,
        firstName: certificationAttestationData.firstName,
        lastName: certificationAttestationData.lastName,
        birthdate: certificationAttestationData.birthdate,
        birthplace: certificationAttestationData.birthplace,
        isPublished: certificationAttestationData.isPublished,
        isCancelled: true,
        createdAt: certificationAttestationData.date,
        verificationCode: certificationAttestationData.verificationCode,
        maxReachableLevelOnCertificationDate: certificationAttestationData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationAttestationData.id }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: certificationAttestationData.pixScore,
        status: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificationAttestationRepository.get)(certificationAttestationData.id);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should throw a NotFoundError when certification is not published', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: false,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
        certificationCenterId,
      }).id;
      databaseBuilder.factory.buildCertificationCourse({
        id: certificationAttestationData.id,
        firstName: certificationAttestationData.firstName,
        lastName: certificationAttestationData.lastName,
        birthdate: certificationAttestationData.birthdate,
        birthplace: certificationAttestationData.birthplace,
        isPublished: certificationAttestationData.isPublished,
        isCancelled: false,
        createdAt: certificationAttestationData.date,
        verificationCode: certificationAttestationData.verificationCode,
        maxReachableLevelOnCertificationDate: certificationAttestationData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationAttestationData.id }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: certificationAttestationData.pixScore,
        status: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificationAttestationRepository.get)(certificationAttestationData.id);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should throw a NotFoundError when certification is rejected', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
        certificationCenterId,
      }).id;
      databaseBuilder.factory.buildCertificationCourse({
        id: certificationAttestationData.id,
        firstName: certificationAttestationData.firstName,
        lastName: certificationAttestationData.lastName,
        birthdate: certificationAttestationData.birthdate,
        birthplace: certificationAttestationData.birthplace,
        isPublished: certificationAttestationData.isPublished,
        isCancelled: false,
        createdAt: certificationAttestationData.date,
        verificationCode: certificationAttestationData.verificationCode,
        maxReachableLevelOnCertificationDate: certificationAttestationData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationAttestationData.id }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: certificationAttestationData.pixScore,
        status: 'rejected',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificationAttestationRepository.get)(certificationAttestationData.id);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should return a CertificationAttestation', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificateId = databaseBuilder.factory.buildCertificationCourse({
        id: certificationAttestationData.id,
        firstName: certificationAttestationData.firstName,
        lastName: certificationAttestationData.lastName,
        birthdate: certificationAttestationData.birthdate,
        birthplace: certificationAttestationData.birthplace,
        isPublished: certificationAttestationData.isPublished,
        isCancelled: false,
        createdAt: certificationAttestationData.date,
        verificationCode: certificationAttestationData.verificationCode,
        maxReachableLevelOnCertificationDate: certificationAttestationData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationAttestationData.id }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: certificationAttestationData.pixScore,
        status: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const certificationAttestation = await certificationAttestationRepository.get(certificationAttestationData.id);

      // then
      const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation({
        id: certificateId,
        ...certificationAttestationData,
      });
      expect(certificationAttestation).to.be.instanceOf(CertificationAttestation);
      expect(certificationAttestation).to.deep.equal(expectedCertificationAttestation);
    });

    it('should get the clea certification result if taken', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.acquired(),
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
        certificationCenterId,
      }).id;
      databaseBuilder.factory.buildCertificationCourse({
        id: certificationAttestationData.id,
        firstName: certificationAttestationData.firstName,
        lastName: certificationAttestationData.lastName,
        birthdate: certificationAttestationData.birthdate,
        birthplace: certificationAttestationData.birthplace,
        isPublished: certificationAttestationData.isPublished,
        isCancelled: false,
        createdAt: certificationAttestationData.date,
        verificationCode: certificationAttestationData.verificationCode,
        maxReachableLevelOnCertificationDate: certificationAttestationData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationAttestationData.id }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: certificationAttestationData.pixScore,
        status: 'validated',
      });
      databaseBuilder.factory.buildBadge({ key: cleaBadgeKey });
      databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: certificationAttestationData.id, partnerKey: cleaBadgeKey, acquired: true });
      await databaseBuilder.commit();

      // when
      const certificationAttestation = await certificationAttestationRepository.get(123);

      // then
      const expectedShareableCertificate = domainBuilder.buildCertificationAttestation({
        ...certificationAttestationData,
      });
      expect(certificationAttestation).to.be.instanceOf(CertificationAttestation);
      expect(certificationAttestation).to.deep.equal(expectedShareableCertificate);
    });
  });
});
