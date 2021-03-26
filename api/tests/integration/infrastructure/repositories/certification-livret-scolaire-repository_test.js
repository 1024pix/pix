const certificationLsRepository = require('../../../../lib/infrastructure/repositories/certification-livret-scolaire-repository');
const { expect, databaseBuilder, knex } = require('../../../test-helper');
const status = require('../../../../lib/domain/read-models/livret-scolaire/CertificateStatus');

const {
  buildOrganization,
  buildCertificationDataWithNoCompetenceMarks,
  buildValidatedPublishedCertificationData,
  buildValidatedUnpublishedCertificationData,
  buildRejectedPublishedCertificationData,
  buildErrorUnpublishedCertificationData,
} = require('../../../../tests/tooling/domain-builder/factory/build-certifications-results-for-ls');

describe('Integration | Repository | Certification-ls ', () => {

  const pixScore = 400;
  const uai = '789567AA';
  const verificationCode = 'P-123498NN';
  const competenceMarks = [{ code: '1.1', level: 6 }, { code: '5.2', level: 4 }];

  afterEach(async () => {
    await knex('competence-marks').delete();
    await knex('partner-certifications').delete();
    await knex('assessment-results').delete();
    await knex('assessments').delete();
    await knex('certification-courses').delete();
    return knex('sessions').delete();
  });

  describe('#getCertificatesByOrganizationUAI', () => {

    it('should return validated certification results for a given UAI', async () => {
      // given
      const organizationId = buildOrganization(uai).id;
      const { schoolingRegistration, session, certificationCourse } = buildValidatedPublishedCertificationData({ organizationId, verificationCode, pixScore, competenceMarks });

      await databaseBuilder.commit();

      const expected = {
        id: certificationCourse.id,
        firstName: schoolingRegistration.firstName,
        middleName: schoolingRegistration.middleName,
        thirdName: schoolingRegistration.thirdName,
        lastName: schoolingRegistration.lastName,
        nationalStudentId: schoolingRegistration.nationalStudentId,
        birthdate: schoolingRegistration.birthdate,
        date: certificationCourse.createdAt,
        verificationCode: certificationCourse.verificationCode,
        deliveredAt: session.publishedAt,
        certificationCenter: session.certificationCenter,
        status: status.VALIDATED,
        pixScore,
        competenceResults: [
          { competenceId: '1.1', level: 6 },
          { competenceId: '5.2', level: 4 },

        ],
      };

      // when
      const certificationResults = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);

      // then
      expect(certificationResults).to.deep.equal([expected]);
    });

    it('should return rejected certification results for a given UAI', async () => {
      // given
      const organizationId = buildOrganization(uai).id;
      buildRejectedPublishedCertificationData({ organizationId, competenceMarks });

      await databaseBuilder.commit();

      // when
      const [certificationResult] = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);

      // then
      expect(certificationResult.status).to.equal(status.REJECTED);
      expect(certificationResult.pixScore).to.equal(0);
      expect(certificationResult.competenceResults).to.be.empty;
    });

    it('should return pending (error) certification results for a given UAI', async () => {
      // given
      const organizationId = buildOrganization(uai).id;
      buildErrorUnpublishedCertificationData({ organizationId });

      await databaseBuilder.commit();

      // when
      const [certificationResult] = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);

      // then
      expect(certificationResult.status).to.equal(status.PENDING);
      expect(certificationResult.pixScore).to.equal(0);
      expect(certificationResult.competenceResults).to.be.empty;
    });

    it('should return pending (validated) certification results for a given UAI', async () => {
      // given
      const organizationId = buildOrganization(uai).id;
      buildValidatedUnpublishedCertificationData({ organizationId });

      await databaseBuilder.commit();

      // when
      const [certificationResult] = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);

      // then
      expect(certificationResult.status).to.equal(status.PENDING);
      expect(certificationResult.pixScore).to.equal(0);
      expect(certificationResult.competenceResults).to.be.empty;
    });

    it('should return no certification results if no competence-marks for a given UAI', async () => {
      // given
      const organizationId = buildOrganization(uai).id;
      buildCertificationDataWithNoCompetenceMarks({ organizationId });

      await databaseBuilder.commit();

      // when
      const certificationResult = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);

      // then
      expect(certificationResult).to.be.empty;
    });
  });

});

