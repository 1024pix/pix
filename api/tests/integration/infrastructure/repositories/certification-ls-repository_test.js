const Assessment = require('../../../../lib/domain/models/Assessment');
const certificationLsRepository = require('../../../../lib/infrastructure/repositories/certification-livret-scolaire-repository');
const { expect, databaseBuilder, knex } = require('../../../test-helper');
const status = require('../../../../lib/domain/read-models/livret-scolaire/CertificateStatus');

const { buildValidatedPublishedCertificationData, buildRejectedPublishedCertificationData, buildErrorUnpublishedCertificationData } = require('../../../../tests/tooling/domain-builder/factory/build-certifications-results-for-ls');

describe('Integration | Repository | Certification-ls ', () => {

  const pixScore = 400;
  const uai = '789567AA';
  const type = Assessment.types.CERTIFICATION;
  const verificationCode = 'P-123498NN';

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

      const { schoolingRegistration, session, certificationCourse } = buildValidatedPublishedCertificationData({ uai, verificationCode, type, pixScore, competenceMarks: [ { code: '1.1', level: 6 }, { code: '5.2', level: 4 }] });

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

      const certificationResults = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);
      expect(certificationResults).to.have.length(1);
      expect(certificationResults[0]).to.deep.equal(expected);
    });

    it('should return rejected certification results for a given UAI', async () => {

      buildRejectedPublishedCertificationData({ uai, verificationCode, type, pixScore });

      await databaseBuilder.commit();

      const [certificationResult] = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);
      expect(certificationResult.status).to.equal(status.REJECTED);
    });

    it('should return pending certification results for a given UAI', async () => {

      buildErrorUnpublishedCertificationData({ uai, verificationCode, type, pixScore });

      await databaseBuilder.commit();

      const [certificationResult] = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);
      expect(certificationResult.status).to.equal(status.PENDING);
    });
  });

});

