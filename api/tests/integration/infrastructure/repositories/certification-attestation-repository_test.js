const { expect, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const CertificationAttestation = require('../../../../lib/domain/models/CertificationAttestation');
const { badgeKey: cleaBadgeKey } = require('../../../../lib/domain/models/CleaCertificationResult');
const { badgeKey: pixPlusDroitMaitreBadgeKey } = require('../../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');
const { badgeKey: pixPlusDroitExpertBadgeKey } = require('../../../../lib/domain/models/PixPlusDroitExpertCertificationResult');
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
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

    it('should take into account the latest validated assessment result of the certification', async () => {
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
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
        pixScore: certificationAttestationData.pixScore + 20,
        status: 'validated',
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: certificationAttestationData.pixScore,
        status: 'validated',
        createdAt: new Date('2020-01-02'),
      });
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: 0,
        status: 'rejected',
        createdAt: new Date('2020-01-03'),
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
        cleaCertificationImagePath: certificationAttestationRepository.macaronCleaPath,
        pixPlusDroitCertificationImagePath: null,
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
      const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation({
        ...certificationAttestationData,
      });
      expect(certificationAttestation).to.be.instanceOf(CertificationAttestation);
      expect(certificationAttestation).to.deep.equal(expectedCertificationAttestation);
    });

    context('acquired certifiable badges', () => {

      it('should get the certified badge images of pixPlusDroitMaitre or pixPlusDroitExpert when those certifications were acquired', async () => {
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
          cleaCertificationImagePath: null,
          pixPlusDroitCertificationImagePath: certificationAttestationRepository.macaronPixPlusDroitExpertPath,
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
        databaseBuilder.factory.buildBadge({ key: pixPlusDroitExpertBadgeKey });
        databaseBuilder.factory.buildBadge({ key: 'should_be_ignored' });
        databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: certificationAttestationData.id, partnerKey: pixPlusDroitExpertBadgeKey, acquired: true });
        databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: certificationAttestationData.id, partnerKey: 'should_be_ignored', acquired: true });
        await databaseBuilder.commit();

        // when
        const certificationAttestation = await certificationAttestationRepository.get(123);

        // then
        const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation({
          ...certificationAttestationData,
        });
        expect(certificationAttestation).to.be.instanceOf(CertificationAttestation);
        expect(certificationAttestation).to.deep.equal(expectedCertificationAttestation);
      });

      it('should only take into account acquired ones', async () => {
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
          cleaCertificationImagePath: null,
          pixPlusDroitCertificationImagePath: certificationAttestationRepository.macaronPixPlusDroitMaitrePath,
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
        databaseBuilder.factory.buildBadge({ key: pixPlusDroitMaitreBadgeKey });
        databaseBuilder.factory.buildBadge({ key: cleaBadgeKey });
        databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: certificationAttestationData.id, partnerKey: pixPlusDroitMaitreBadgeKey, acquired: true });
        databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: certificationAttestationData.id, partnerKey: cleaBadgeKey, acquired: false });
        await databaseBuilder.commit();

        // when
        const certificationAttestation = await certificationAttestationRepository.get(123);

        // then
        const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation({
          ...certificationAttestationData,
        });
        expect(certificationAttestation).to.be.instanceOf(CertificationAttestation);
        expect(certificationAttestation).to.deep.equal(expectedCertificationAttestation);
      });
    });
  });

  describe('#findByDivisionForScoIsManagingStudentsOrganization', () => {

    it('should return an empty array when there are no certification attestations', async () => {
      // when
      const certificationAttestations = await certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization();

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should not return certifications that have no validated assessment-result', async () => {
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
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
      const certificationAttestations = await certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization();

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should not return cancelled certifications', async () => {
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
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
      const certificationAttestations = await certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization();

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should not return non published certifications', async () => {
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
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

    it('should return an array of certification attestations ordered by ID', async () => {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      // Certification ID 456
      const userId2 = databaseBuilder.factory.buildUser().id;
      const certificationAttestationData2 = {
        id: 456,
        firstName: 'James',
        lastName: 'Marsters',
        birthdate: '1962-08-20',
        birthplace: 'Trouville',
        isPublished: true,
        userId: userId2,
        date: new Date('2020-05-01'),
        verificationCode: 'P-SOMEOTHERCODE',
        maxReachableLevelOnCertificationDate: 6,
        deliveredAt: new Date('2021-07-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 23,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
      };
      const sessionId2 = databaseBuilder.factory.buildSession({
        publishedAt: certificationAttestationData2.deliveredAt,
        certificationCenter: certificationAttestationData2.certificationCenter,
        certificationCenterId,
      }).id;
      databaseBuilder.factory.buildCertificationCourse({
        id: certificationAttestationData2.id,
        firstName: certificationAttestationData2.firstName,
        lastName: certificationAttestationData2.lastName,
        birthdate: certificationAttestationData2.birthdate,
        birthplace: certificationAttestationData2.birthplace,
        isPublished: certificationAttestationData2.isPublished,
        isCancelled: false,
        createdAt: certificationAttestationData2.date,
        verificationCode: certificationAttestationData2.verificationCode,
        maxReachableLevelOnCertificationDate: certificationAttestationData2.maxReachableLevelOnCertificationDate,
        sessionId: sessionId2,
        userId: userId2,
      }).id;
      const assessmentId2 = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationAttestationData2.id }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentId2,
        pixScore: certificationAttestationData2.pixScore,
        status: 'validated',
      });
      // Certification ID 123
      const userId1 = databaseBuilder.factory.buildUser().id;
      const certificationAttestationData1 = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: userId1,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
      };
      const sessionId1 = databaseBuilder.factory.buildSession({
        publishedAt: certificationAttestationData1.deliveredAt,
        certificationCenter: certificationAttestationData1.certificationCenter,
        certificationCenterId,
      }).id;
      databaseBuilder.factory.buildCertificationCourse({
        id: certificationAttestationData1.id,
        firstName: certificationAttestationData1.firstName,
        lastName: certificationAttestationData1.lastName,
        birthdate: certificationAttestationData1.birthdate,
        birthplace: certificationAttestationData1.birthplace,
        isPublished: certificationAttestationData1.isPublished,
        isCancelled: false,
        createdAt: certificationAttestationData1.date,
        verificationCode: certificationAttestationData1.verificationCode,
        maxReachableLevelOnCertificationDate: certificationAttestationData1.maxReachableLevelOnCertificationDate,
        sessionId: sessionId1,
        userId: userId1,
      }).id;
      const assessmentId1 = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationAttestationData1.id }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentId1,
        pixScore: certificationAttestationData1.pixScore,
        status: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const certificationAttestations = await certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization();

      // then
      const expectedCertificationAttestation1 = domainBuilder.buildCertificationAttestation(certificationAttestationData1);
      const expectedCertificationAttestation2 = domainBuilder.buildCertificationAttestation(certificationAttestationData2);
      expect(certificationAttestations).to.have.length(2);
      expect(certificationAttestations[0]).to.be.instanceOf(CertificationAttestation);
      expect(certificationAttestations[0]).to.deep.equal(expectedCertificationAttestation1);
      expect(certificationAttestations[1]).to.be.instanceOf(CertificationAttestation);
      expect(certificationAttestations[1]).to.deep.equal(expectedCertificationAttestation2);
    });

    it('should take into account the latest validated assessment result of a certification', async () => {
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
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
        pixScore: certificationAttestationData.pixScore + 20,
        status: 'validated',
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: certificationAttestationData.pixScore,
        status: 'validated',
        createdAt: new Date('2020-01-02'),
      });
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: 0,
        status: 'rejected',
        createdAt: new Date('2020-01-03'),
      });
      await databaseBuilder.commit();

      // when
      const certificationAttestations = await certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization();

      // then
      const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation({
        id: certificateId,
        ...certificationAttestationData,
      });
      expect(certificationAttestations).to.have.length(1);
      expect(certificationAttestations[0]).to.be.instanceOf(CertificationAttestation);
      expect(certificationAttestations[0]).to.deep.equal(expectedCertificationAttestation);
    });
  });
});
