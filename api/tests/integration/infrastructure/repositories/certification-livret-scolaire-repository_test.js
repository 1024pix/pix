import * as certificationLsRepository from '../../../../lib/infrastructure/repositories/certification-livret-scolaire-repository.js';
import { expect, databaseBuilder } from '../../../test-helper.js';
import { status } from '../../../../lib/domain/read-models/livret-scolaire/CertificateStatus.js';

import {
  buildUser,
  buildOrganizationLearner,
  buildOrganization,
  buildCertificationDataWithNoCompetenceMarks,
  buildValidatedPublishedCertificationData,
  buildValidatedUnpublishedCertificationData,
  buildCancelledCertificationData,
  buildRejectedPublishedCertificationData,
  buildErrorUnpublishedCertificationData,
} from '../../../../tests/tooling/domain-builder/factory/build-certifications-results-for-ls.js';

describe('Integration | Repository | Certification-ls ', function () {
  const pixScore = 400;
  const uai = '789567AA';
  const verificationCode = 'P-123498NN';
  const competenceMarks = [
    {
      code: '1.1',
      level: 6,
    },
    {
      code: '5.2',
      level: 4,
    },
  ];

  describe('#getCertificatesByOrganizationUAI', function () {
    it('should return validated certification results for a given UAI', async function () {
      // given
      const organizationId = buildOrganization(uai).id;
      const user = buildUser();
      const organizationLearner = buildOrganizationLearner({
        userId: user.id,
        organizationId,
      });
      const { session, certificationCourse } = buildValidatedPublishedCertificationData({
        user,
        organizationLearner,
        verificationCode,
        pixScore,
        competenceMarks,
      });

      await databaseBuilder.commit();

      const expected = {
        id: certificationCourse.id,
        firstName: organizationLearner.firstName,
        middleName: organizationLearner.middleName,
        thirdName: organizationLearner.thirdName,
        lastName: organizationLearner.lastName,
        nationalStudentId: organizationLearner.nationalStudentId,
        birthdate: organizationLearner.birthdate,
        date: certificationCourse.createdAt,
        verificationCode: certificationCourse.verificationCode,
        deliveredAt: session.publishedAt,
        certificationCenter: session.certificationCenter,
        status: status.VALIDATED,
        pixScore,
        competenceResults: [
          {
            competenceId: '1.1',
            level: 6,
          },
          {
            competenceId: '5.2',
            level: 4,
          },
        ],
      };

      // when
      const certificationResults = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);

      // then
      expect(certificationResults).to.deep.equal([expected]);
    });

    it('should not return disabled organization learner certification results for a given UAI', async function () {
      // given
      const organizationId = buildOrganization(uai).id;
      const user = buildUser();
      const organizationLearner = buildOrganizationLearner({
        userId: user.id,
        organizationId,
        isDisabled: true,
      });

      buildValidatedPublishedCertificationData({
        user,
        organizationLearner,
        verificationCode,
        pixScore,
        competenceMarks,
      });

      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);

      // then
      expect(certificationResults).to.deep.equal([]);
    });

    it('should not return cancelled certification for a given UAI', async function () {
      // given
      const organizationId = buildOrganization(uai).id;
      const user = buildUser();
      const organizationLearner = buildOrganizationLearner({
        userId: user.id,
        organizationId,
      });
      buildCancelledCertificationData({
        user,
        organizationLearner,
        verificationCode,
        pixScore,
        competenceMarks,
      });

      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);

      // then
      expect(certificationResults).to.deep.equal([]);
    });

    it('should return rejected certification results for a given UAI', async function () {
      // given
      const organizationId = buildOrganization(uai).id;
      const user = buildUser();
      const organizationLearner = buildOrganizationLearner({
        userId: user.id,
        organizationId,
      });
      buildRejectedPublishedCertificationData({
        user,
        organizationLearner,
        competenceMarks,
      });

      await databaseBuilder.commit();

      // when
      const [certificationResult] = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);

      // then
      expect(certificationResult.status).to.equal(status.REJECTED);
      expect(certificationResult.pixScore).to.equal(0);
      expect(certificationResult.competenceResults).to.be.empty;
    });

    it('should return pending (error) certification results for a given UAI', async function () {
      // given
      const organizationId = buildOrganization(uai).id;
      const user = buildUser();
      const organizationLearner = buildOrganizationLearner({
        userId: user.id,
        organizationId,
      });
      buildErrorUnpublishedCertificationData({
        user,
        organizationLearner,
      });

      await databaseBuilder.commit();

      // when
      const [certificationResult] = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);

      // then
      expect(certificationResult.status).to.equal(status.PENDING);
      expect(certificationResult.pixScore).to.equal(0);
      expect(certificationResult.competenceResults).to.be.empty;
    });

    it('should return pending (validated) certification results for a given UAI', async function () {
      // given
      const organizationId = buildOrganization(uai).id;
      const user = buildUser();
      const organizationLearner = buildOrganizationLearner({
        userId: user.id,
        organizationId,
      });
      buildValidatedUnpublishedCertificationData({
        user,
        organizationLearner,
      });

      await databaseBuilder.commit();

      // when
      const [certificationResult] = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);

      // then
      expect(certificationResult.status).to.equal(status.PENDING);
      expect(certificationResult.pixScore).to.equal(0);
      expect(certificationResult.competenceResults).to.be.empty;
    });

    it('should return no certification results if no competence-marks for a given UAI', async function () {
      // given
      const organizationId = buildOrganization(uai).id;
      const user = buildUser();
      const organizationLearner = buildOrganizationLearner({
        userId: user.id,
        organizationId,
      });
      buildCertificationDataWithNoCompetenceMarks({
        user,
        organizationLearner,
      });

      await databaseBuilder.commit();

      // when
      const certificationResult = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);

      // then
      expect(certificationResult).to.be.empty;
    });

    it('should return certification from student even if this certification was from another other organisation', async function () {
      // given
      const organizationId = buildOrganization(uai).id;
      const user = buildUser();
      buildOrganizationLearner({
        userId: user.id,
        organizationId,
      });
      const formerOrganizationId = buildOrganization().id;
      const formerOrganizationLearner = buildOrganizationLearner({
        userId: user.id,
        formerOrganizationId,
      });

      buildValidatedPublishedCertificationData({
        user,
        organizationLearner: formerOrganizationLearner,
        verificationCode,
        pixScore,
        competenceMarks,
      });

      await databaseBuilder.commit();

      // when
      const [certificationResult] = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);

      // then
      expect(certificationResult.status).to.equal(status.VALIDATED);
      expect(certificationResult.pixScore).not.to.equal(0);
      expect(certificationResult.competenceResults).not.to.be.empty;
    });

    it('should return only the last (not cancelled) certification', async function () {
      // given
      const organizationId = buildOrganization(uai).id;
      const user = buildUser();
      const organizationLearner = buildOrganizationLearner({
        userId: user.id,
        organizationId,
      });
      buildValidatedPublishedCertificationData({
        user,
        organizationLearner,
        certificationCreatedDate: new Date('2022-02-20T14:23:56Z'),
      });

      const { certificationCourse: lastCertificationCourse } = buildValidatedPublishedCertificationData({
        user,
        organizationLearner,
        certificationCreatedDate: new Date('2022-02-22T14:23:56Z'),
      });

      buildValidatedPublishedCertificationData({
        user,
        organizationLearner,
        certificationCreatedDate: new Date('2022-02-21T14:23:56Z'),
      });

      buildCancelledCertificationData({
        user,
        organizationLearner,
        certificationCreatedDate: new Date('2022-02-23T14:23:56Z'),
      });

      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);

      // then
      expect(certificationResults).to.have.length(1);
      expect(certificationResults[0].id).to.equal(lastCertificationCourse.id);
    });

    it('should return 0 (low level) and -1 (rejected) competence level', async function () {
      // given
      const organizationId = buildOrganization(uai).id;
      const user = buildUser();
      const organizationLearner = buildOrganizationLearner({
        userId: user.id,
        organizationId,
      });
      buildValidatedPublishedCertificationData({
        user,
        organizationLearner,
        verificationCode,
        pixScore,
        competenceMarks: [
          {
            code: '5.2',
            level: -1,
          },
          {
            code: '1.1',
            level: 0,
          },
        ],
      });

      await databaseBuilder.commit();

      const expectedCompetenceResults = [
        {
          competenceId: '1.1',
          level: 0,
        },
        {
          competenceId: '5.2',
          level: -1,
        },
      ];

      // when
      const [certificationResult] = await certificationLsRepository.getCertificatesByOrganizationUAI(uai);

      // then
      expect(certificationResult.competenceResults).to.deep.equal(expectedCompetenceResults);
    });
  });
});
