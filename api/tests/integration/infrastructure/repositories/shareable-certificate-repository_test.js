const { expect, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const shareableCertificateRepository = require('../../../../lib/infrastructure/repositories/shareable-certificate-repository');
const ShareableCertificate = require('../../../../lib/domain/models/ShareableCertificate');
const { badgeKey: cleaBadgeKey } = require('../../../../lib/domain/models/CleaCertificationResult');
const { badgeKey: pixPlusDroitMaitreBadgeKey } = require('../../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');
const { badgeKey: pixPlusDroitExpertBadgeKey } = require('../../../../lib/domain/models/PixPlusDroitExpertCertificationResult');

describe('Integration | Infrastructure | Repository | Shareable Certificate', () => {

  describe('#getByVerificationCode', () => {

    it('should throw a NotFoundError when shareable certificate does not exist', async () => {
      // when
      const error = await catchErr(shareableCertificateRepository.getByVerificationCode)({ verificationCode: 'P-SOMECODE' });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with verification code "P-SOMECODE"');
    });

    it('should throw a NotFoundError when certificate has no assessment-result', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const shareableCertificateData = {
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
        publishedAt: shareableCertificateData.deliveredAt,
        certificationCenter: shareableCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificateId = databaseBuilder.factory.buildCertificationCourse({
        firstName: shareableCertificateData.firstName,
        lastName: shareableCertificateData.lastName,
        birthdate: shareableCertificateData.birthdate,
        birthplace: shareableCertificateData.birthplace,
        isPublished: shareableCertificateData.isPublished,
        isCancelled: false,
        createdAt: shareableCertificateData.date,
        verificationCode: shareableCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: shareableCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId }).id;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(shareableCertificateRepository.getByVerificationCode)({ verificationCode: 'P-SOMECODE' });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with verification code "P-SOMECODE"');
    });

    it('should throw a NotFoundError when certificate is cancelled', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const shareableCertificateData = {
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
        publishedAt: shareableCertificateData.deliveredAt,
        certificationCenter: shareableCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificateId = databaseBuilder.factory.buildCertificationCourse({
        firstName: shareableCertificateData.firstName,
        lastName: shareableCertificateData.lastName,
        birthdate: shareableCertificateData.birthdate,
        birthplace: shareableCertificateData.birthplace,
        isPublished: shareableCertificateData.isPublished,
        isCancelled: true,
        createdAt: shareableCertificateData.date,
        verificationCode: shareableCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: shareableCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: shareableCertificateData.pixScore,
        status: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(shareableCertificateRepository.getByVerificationCode)({ verificationCode: 'P-SOMECODE' });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with verification code "P-SOMECODE"');
    });

    it('should throw a NotFoundError when certificate is not published', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const shareableCertificateData = {
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
        publishedAt: shareableCertificateData.deliveredAt,
        certificationCenter: shareableCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificateId = databaseBuilder.factory.buildCertificationCourse({
        firstName: shareableCertificateData.firstName,
        lastName: shareableCertificateData.lastName,
        birthdate: shareableCertificateData.birthdate,
        birthplace: shareableCertificateData.birthplace,
        isPublished: shareableCertificateData.isPublished,
        isCancelled: false,
        createdAt: shareableCertificateData.date,
        verificationCode: shareableCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: shareableCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: shareableCertificateData.pixScore,
        status: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(shareableCertificateRepository.getByVerificationCode)({ verificationCode: 'P-SOMECODE' });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with verification code "P-SOMECODE"');
    });

    it('should throw a NotFoundError when certificate is rejected', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const shareableCertificateData = {
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
        publishedAt: shareableCertificateData.deliveredAt,
        certificationCenter: shareableCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificateId = databaseBuilder.factory.buildCertificationCourse({
        firstName: shareableCertificateData.firstName,
        lastName: shareableCertificateData.lastName,
        birthdate: shareableCertificateData.birthdate,
        birthplace: shareableCertificateData.birthplace,
        isPublished: shareableCertificateData.isPublished,
        isCancelled: false,
        createdAt: shareableCertificateData.date,
        verificationCode: shareableCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: shareableCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: shareableCertificateData.pixScore,
        status: 'rejected',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(shareableCertificateRepository.getByVerificationCode)({ verificationCode: 'P-SOMECODE' });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with verification code "P-SOMECODE"');
    });

    it('should return a ShareableCertificate', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const shareableCertificateData = {
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
        publishedAt: shareableCertificateData.deliveredAt,
        certificationCenter: shareableCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificateId = databaseBuilder.factory.buildCertificationCourse({
        firstName: shareableCertificateData.firstName,
        lastName: shareableCertificateData.lastName,
        birthdate: shareableCertificateData.birthdate,
        birthplace: shareableCertificateData.birthplace,
        isPublished: shareableCertificateData.isPublished,
        isCancelled: false,
        createdAt: shareableCertificateData.date,
        verificationCode: shareableCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: shareableCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: shareableCertificateData.pixScore,
        status: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const shareableCertificate = await shareableCertificateRepository.getByVerificationCode({ verificationCode: 'P-SOMECODE' });

      // then
      const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
        id: certificateId,
        ...shareableCertificateData,
      });
      expect(shareableCertificate).to.be.instanceOf(ShareableCertificate);
      expect(shareableCertificate).to.deep.equal(expectedShareableCertificate);
    });

    it('should get the clea certification result if taken', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const shareableCertificateData = {
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
        publishedAt: shareableCertificateData.deliveredAt,
        certificationCenter: shareableCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificateId = databaseBuilder.factory.buildCertificationCourse({
        firstName: shareableCertificateData.firstName,
        lastName: shareableCertificateData.lastName,
        birthdate: shareableCertificateData.birthdate,
        birthplace: shareableCertificateData.birthplace,
        isPublished: shareableCertificateData.isPublished,
        isCancelled: false,
        createdAt: shareableCertificateData.date,
        verificationCode: shareableCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: shareableCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: shareableCertificateData.pixScore,
        status: 'validated',
      });
      databaseBuilder.factory.buildBadge({ key: cleaBadgeKey });
      databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: certificateId, partnerKey: cleaBadgeKey, acquired: true });
      await databaseBuilder.commit();

      // when
      const shareableCertificate = await shareableCertificateRepository.getByVerificationCode({ verificationCode: 'P-SOMECODE' });

      // then
      const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
        id: certificateId,
        ...shareableCertificateData,
      });
      expect(shareableCertificate).to.be.instanceOf(ShareableCertificate);
      expect(shareableCertificate).to.deep.equal(expectedShareableCertificate);
    });

    context('acquired certifiable badges', () => {

      it('should get the certified badge images of pixPlusDroitMaitre and/or pixPlusDroitExpert when those certifications were acquired', async () => {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const shareableCertificateData = {
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
          certifiedBadgeImages: [
            'image/to/expert',
            'image/to/maitre',
          ],
        };
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const sessionId = databaseBuilder.factory.buildSession({
          publishedAt: shareableCertificateData.deliveredAt,
          certificationCenter: shareableCertificateData.certificationCenter,
          certificationCenterId,
        }).id;
        const certificateId = databaseBuilder.factory.buildCertificationCourse({
          firstName: shareableCertificateData.firstName,
          lastName: shareableCertificateData.lastName,
          birthdate: shareableCertificateData.birthdate,
          birthplace: shareableCertificateData.birthplace,
          isPublished: shareableCertificateData.isPublished,
          isCancelled: false,
          createdAt: shareableCertificateData.date,
          verificationCode: shareableCertificateData.verificationCode,
          maxReachableLevelOnCertificationDate: shareableCertificateData.maxReachableLevelOnCertificationDate,
          sessionId,
          userId,
        }).id;
        const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId }).id;
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId,
          pixScore: shareableCertificateData.pixScore,
          status: 'validated',
        });
        databaseBuilder.factory.buildBadge({ key: pixPlusDroitExpertBadgeKey, isCertifiable: true, certifiedImageUrl: 'image/to/expert' });
        databaseBuilder.factory.buildBadge({ key: pixPlusDroitMaitreBadgeKey, isCertifiable: true, certifiedImageUrl: 'image/to/maitre' });
        databaseBuilder.factory.buildBadge({ key: 'should_be_ignored', isCertifiable: true, certifiedImageUrl: 'some/horrible/image' });
        databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: certificateId, partnerKey: pixPlusDroitExpertBadgeKey, acquired: true });
        databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: certificateId, partnerKey: pixPlusDroitMaitreBadgeKey, acquired: true });
        databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: certificateId, partnerKey: 'should_be_ignored', acquired: true });
        await databaseBuilder.commit();

        // when
        const shareableCertificate = await shareableCertificateRepository.getByVerificationCode({ verificationCode: 'P-SOMECODE' });

        // then
        const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
          id: certificateId,
          ...shareableCertificateData,
        });
        expect(shareableCertificate).to.be.instanceOf(ShareableCertificate);
        expect(shareableCertificate).to.deep.equal(expectedShareableCertificate);
      });

      it('should only take into account acquired ones', async () => {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const shareableCertificateData = {
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
          certifiedBadgeImages: [
            'image/to/expert',
          ],
        };
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const sessionId = databaseBuilder.factory.buildSession({
          publishedAt: shareableCertificateData.deliveredAt,
          certificationCenter: shareableCertificateData.certificationCenter,
          certificationCenterId,
        }).id;
        const certificateId = databaseBuilder.factory.buildCertificationCourse({
          firstName: shareableCertificateData.firstName,
          lastName: shareableCertificateData.lastName,
          birthdate: shareableCertificateData.birthdate,
          birthplace: shareableCertificateData.birthplace,
          isPublished: shareableCertificateData.isPublished,
          isCancelled: false,
          createdAt: shareableCertificateData.date,
          verificationCode: shareableCertificateData.verificationCode,
          maxReachableLevelOnCertificationDate: shareableCertificateData.maxReachableLevelOnCertificationDate,
          sessionId,
          userId,
        }).id;
        const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId }).id;
        databaseBuilder.factory.buildAssessmentResult({
          assessmentId,
          pixScore: shareableCertificateData.pixScore,
          status: 'validated',
        });
        databaseBuilder.factory.buildBadge({ key: pixPlusDroitExpertBadgeKey, isCertifiable: true, certifiedImageUrl: 'image/to/expert' });
        databaseBuilder.factory.buildBadge({ key: pixPlusDroitMaitreBadgeKey, isCertifiable: true, certifiedImageUrl: 'image/to/maitre' });
        databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: certificateId, partnerKey: pixPlusDroitExpertBadgeKey, acquired: true });
        databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: certificateId, partnerKey: pixPlusDroitMaitreBadgeKey, acquired: false });
        await databaseBuilder.commit();

        // when
        const shareableCertificate = await shareableCertificateRepository.getByVerificationCode({ verificationCode: 'P-SOMECODE' });

        // then
        const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
          id: certificateId,
          ...shareableCertificateData,
        });
        expect(shareableCertificate).to.be.instanceOf(ShareableCertificate);
        expect(shareableCertificate).to.deep.equal(expectedShareableCertificate);
      });
    });
  });
});
