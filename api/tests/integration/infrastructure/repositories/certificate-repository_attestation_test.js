import {
  expect,
  databaseBuilder,
  domainBuilder,
  catchErr,
  learningContentBuilder,
  mockLearningContent,
} from '../../../test-helper.js';

import { NotFoundError } from '../../../../lib/domain/errors.js';
import * as certificationRepository from '../../../../lib/infrastructure/repositories/certificate-repository.js';

describe('Integration | Infrastructure | Repository | Certification Attestation', function () {
  const minimalLearningContent = [
    {
      id: 'recArea0',
      code: '1',
      competences: [
        {
          id: 'recNv8qhaY887jQb2',
          index: '1.3',
          name: 'Traiter des données',
        },
      ],
    },
  ];

  describe('#getCertificationAttestation', function () {
    it('should throw a NotFoundError when certification attestation does not exist', async function () {
      // when
      const error = await catchErr(certificationRepository.getCertificationAttestation)(123);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should throw a NotFoundError when certification has no assessment-result', async function () {
      // given
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        certifiedBadges: [],
        sessionId: 789,
      };
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildIncomplete(certificationAttestationData);
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificationRepository.getCertificationAttestation)(
        certificationAttestationData.id,
      );

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should throw a NotFoundError when certification is cancelled', async function () {
      // given
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        certifiedBadges: [],
        sessionId: 789,
      };
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildCancelled(certificationAttestationData);
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificationRepository.getCertificationAttestation)(
        certificationAttestationData.id,
      );

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should throw a NotFoundError when certification is not published', async function () {
      // given
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: false,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        certifiedBadges: [],
        sessionId: 789,
      };
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildValidCertificationAttestation(certificationAttestationData);
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificationRepository.getCertificationAttestation)(
        certificationAttestationData.id,
      );

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should throw a NotFoundError when certification is rejected', async function () {
      // given
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        certifiedBadges: [],
        sessionId: 789,
      };
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildRejected(certificationAttestationData);
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificationRepository.getCertificationAttestation)(
        certificationAttestationData.id,
      );

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should return a CertificationAttestation', async function () {
      // given
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);

      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        certifiedBadges: [],
        sessionId: 789,
      };
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildValidCertificationAttestation(certificationAttestationData);
      await databaseBuilder.commit();

      // when
      const certificationAttestation = await certificationRepository.getCertificationAttestation(123);

      // then
      const expectedCertificationAttestation =
        domainBuilder.buildCertificationAttestation(certificationAttestationData);
      expect(certificationAttestation).to.deepEqualInstanceOmitting(expectedCertificationAttestation, [
        'resultCompetenceTree',
      ]);
    });

    it('should return a CertificationAttestation with appropriate result competence tree', async function () {
      // given
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        certifiedBadges: [],
        sessionId: 789,
      };
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      const assessmentResultId = _buildValidCertificationAttestation(certificationAttestationData, false);

      const competenceMarks1 = domainBuilder.buildCompetenceMark({
        id: 1234,
        level: 4,
        score: 32,
        area_code: '1',
        competence_code: '1.1',
        competenceId: 'recComp1',
        assessmentResultId,
      });
      databaseBuilder.factory.buildCompetenceMark(competenceMarks1);

      const competenceMarks2 = domainBuilder.buildCompetenceMark({
        id: 4567,
        level: 5,
        score: 40,
        area_code: '1',
        competence_code: '1.2',
        competenceId: 'recComp2',
        assessmentResultId,
      });
      databaseBuilder.factory.buildCompetenceMark(competenceMarks2);

      await databaseBuilder.commit();

      const competence1 = domainBuilder.buildCompetence({
        id: 'recComp1',
        index: '1.1',
        name: 'Traiter des données',
      });
      const competence2 = domainBuilder.buildCompetence({
        id: 'recComp2',
        index: '1.2',
        name: 'Traiter des choux',
      });
      const area1 = domainBuilder.buildArea({
        id: 'recArea1',
        code: '1',
        competences: [
          { ...competence1, name_i18n: { fr: competence1.name } },
          { ...competence2, name_i18n: { fr: competence2.name } },
        ],
        title: 'titre test',
        framework: null,
      });

      const learningContentObjects = learningContentBuilder.fromAreas([{ ...area1, title_i18n: { fr: area1.title } }]);
      mockLearningContent(learningContentObjects);

      // when
      const certificationAttestation = await certificationRepository.getCertificationAttestation(123);

      // then
      const expectedResultCompetenceTree = domainBuilder.buildResultCompetenceTree({
        id: `123-${assessmentResultId}`,
        competenceMarks: [competenceMarks1, competenceMarks2],
        competenceTree: domainBuilder.buildCompetenceTree({ areas: [area1] }),
      });
      expect(certificationAttestation.resultCompetenceTree).to.deepEqualInstance(expectedResultCompetenceTree);
    });

    it('should take into account the latest validated assessment result of a student', async function () {
      // given
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        certifiedBadges: [],
        sessionId: 789,
      };

      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildCertificationAttestationWithSeveralResults(certificationAttestationData);
      await databaseBuilder.commit();

      // when
      const certificationAttestation = await certificationRepository.getCertificationAttestation(
        certificationAttestationData.id,
      );

      // then
      const expectedCertificationAttestation =
        domainBuilder.buildCertificationAttestation(certificationAttestationData);
      expect(certificationAttestation).to.deepEqualInstanceOmitting(expectedCertificationAttestation, [
        'resultCompetenceTree',
      ]);
    });

    context('acquired certifiable badges', function () {
      it(`should get the certified badge images when the certifications were acquired`, async function () {
        // given
        const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
        mockLearningContent(learningContentObjects);
        const certificationAttestationData = {
          id: 123,
          firstName: 'Sarah Michelle',
          lastName: 'Gellar',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          userId: 456,
          date: new Date('2020-01-01'),
          verificationCode: 'P-SOMECODE',
          maxReachableLevelOnCertificationDate: 5,
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: 51,
          certifiedBadges: [
            {
              isTemporaryBadge: false,
              label: 'Pix+ Test 1',
              partnerKey: 'PIX_TEST_1',
              imageUrl: 'https://images.pix.fr/badge1.svg',
              stickerUrl: 'https://images.pix.fr/skicker1.pdf',
              message: 'Pix+ Test 1 certificate message',
            },
            {
              isTemporaryBadge: true,
              label: 'Pix+ Test 2',
              partnerKey: 'PIX_TEST_2',
              imageUrl: 'https://images.pix.fr/badge2.svg',
              stickerUrl: 'https://images.pix.fr/skicker2.pdf',
              message: 'Pix+ Test 2 temporary certificate message',
            },
          ],
          sessionId: 789,
        };

        _buildSession({
          userId: certificationAttestationData.userId,
          sessionId: certificationAttestationData.sessionId,
          publishedAt: certificationAttestationData.deliveredAt,
          certificationCenter: certificationAttestationData.certificationCenter,
        });
        _buildValidCertificationAttestation(certificationAttestationData);
        const badge1Id = databaseBuilder.factory.buildBadge({ key: 'PIX_TEST_1' }).id;
        const badge2Id = databaseBuilder.factory.buildBadge({ key: 'PIX_TEST_2' }).id;
        const complementaryCertification1Id = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Test 1',
          hasExternalJury: false,
        }).id;
        const complementaryCertification2Id = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Test 2',
          hasExternalJury: true,
        }).id;
        const complementaryCertificationBadge1Id = databaseBuilder.factory.buildComplementaryCertificationBadge({
          label: 'Pix+ Test 1',
          badgeId: badge1Id,
          complementaryCertificationId: complementaryCertification1Id,
          imageUrl: 'https://images.pix.fr/badge1.svg',
          stickerUrl: 'https://images.pix.fr/skicker1.pdf',
          certificateMessage: 'Pix+ Test 1 certificate message',
          temporaryCertificateMessage: '',
        }).id;
        const complementaryCertificationBadge2Id = databaseBuilder.factory.buildComplementaryCertificationBadge({
          label: 'Pix+ Test 2',
          badgeId: badge2Id,
          complementaryCertificationId: complementaryCertification2Id,
          imageUrl: 'https://images.pix.fr/badge2.svg',
          stickerUrl: 'https://images.pix.fr/skicker2.pdf',
          certificateMessage: 'Pix+ Test 2 certificate message',
          temporaryCertificateMessage: 'Pix+ Test 2 temporary certificate message',
        }).id;

        databaseBuilder.factory.buildComplementaryCertificationCourse({
          id: 998,
          certificationCourseId: 123,
          complementaryCertificationId: complementaryCertification1Id,
          complementaryCertificationBadgeId: complementaryCertificationBadge1Id,
        });
        databaseBuilder.factory.buildComplementaryCertificationCourse({
          id: 999,
          certificationCourseId: 123,
          complementaryCertificationId: complementaryCertification2Id,
          complementaryCertificationBadgeId: complementaryCertificationBadge2Id,
        });
        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 998,
          partnerKey: 'PIX_TEST_1',
          acquired: true,
        });
        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 999,
          partnerKey: 'PIX_TEST_2',
          acquired: true,
        });
        await databaseBuilder.commit();

        // when
        const certificationAttestation = await certificationRepository.getCertificationAttestation(123);

        // then
        const expectedCertificationAttestation =
          domainBuilder.buildCertificationAttestation(certificationAttestationData);
        expect(certificationAttestation).deepEqualInstanceOmitting(expectedCertificationAttestation, [
          'resultCompetenceTree',
        ]);
      });
    });
  });
});

function _buildIncomplete(certificationAttestationData) {
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
    sessionId: certificationAttestationData.sessionId,
    userId: certificationAttestationData.userId,
  });
  databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationAttestationData.id });
}

function _buildRejected(certificationAttestationData) {
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
    sessionId: certificationAttestationData.sessionId,
    userId: certificationAttestationData.userId,
  });

  databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId: certificationAttestationData.id,
    pixScore: certificationAttestationData.pixScore,
    status: 'rejected',
  });
}

function _buildCancelled(certificationAttestationData) {
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
    sessionId: certificationAttestationData.sessionId,
    userId: certificationAttestationData.userId,
  });
  databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId: certificationAttestationData.id,
    pixScore: certificationAttestationData.pixScore,
    status: 'validated',
  });
}

function _buildValidCertificationAttestation(certificationAttestationData, buildCompetenceMark = true) {
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
    sessionId: certificationAttestationData.sessionId,
    userId: certificationAttestationData.userId,
  });
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId: certificationAttestationData.id,
    pixScore: certificationAttestationData.pixScore,
    status: 'validated',
    createdAt: new Date('2020-01-02'),
  }).id;

  if (buildCompetenceMark) {
    databaseBuilder.factory.buildCompetenceMark({
      assessmentResultId,
    });
  }

  return assessmentResultId;
}

function _buildSession({ userId, sessionId, publishedAt, certificationCenter }) {
  databaseBuilder.factory.buildUser({ id: userId });
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  databaseBuilder.factory.buildSession({
    id: sessionId,
    publishedAt,
    certificationCenter: certificationCenter,
    certificationCenterId,
  });
}

function _buildCertificationAttestationWithSeveralResults(certificationAttestationData, status = 'validated') {
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
    sessionId: certificationAttestationData.sessionId,
    userId: certificationAttestationData.userId,
  }).id;
  const assessmentId = databaseBuilder.factory.buildAssessment({
    certificationCourseId: certificationAttestationData.id,
  }).id;
  const assessmentResultId1 = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: certificationAttestationData.pixScore,
    status: 'rejected',
    createdAt: new Date('2019-01-01'),
  }).id;
  const assessmentResultId2 = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId: certificationAttestationData.id,
    assessmentId,
    pixScore: certificationAttestationData.pixScore,
    status,
    createdAt: new Date('2019-01-02'),
  }).id;

  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId: assessmentResultId1,
  });
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId: assessmentResultId2,
  });
}
