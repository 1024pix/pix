import {
  expect,
  databaseBuilder,
  domainBuilder,
  catchErr,
  learningContentBuilder,
  mockLearningContent,
} from '../../../test-helper.js';

import { NotFoundError } from '../../../../lib/domain/errors.js';
import * as certificateRepository from '../../../../lib/infrastructure/repositories/certificate-repository.js';

describe('Integration | Infrastructure | Repository | Shareable Certificate', function () {
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

  describe('#getShareableCertificateByVerificationCode', function () {
    it('should throw a NotFoundError when shareable certificate does not exist', async function () {
      // when
      const error = await catchErr(certificateRepository.getShareableCertificateByVerificationCode)('P-SOMECODE');

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with verification code "P-SOMECODE"');
    });

    it('should throw a NotFoundError when certificate has no assessment-result', async function () {
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
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
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
      databaseBuilder.factory.buildAssessment({ certificationCourseId });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getShareableCertificateByVerificationCode)('P-SOMECODE');

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with verification code "P-SOMECODE"');
    });

    it('should throw a NotFoundError when certificate is cancelled', async function () {
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
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
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
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: shareableCertificateData.pixScore,
        status: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getShareableCertificateByVerificationCode)('P-SOMECODE');

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with verification code "P-SOMECODE"');
    });

    it('should throw a NotFoundError when certificate is not published', async function () {
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
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
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
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: shareableCertificateData.pixScore,
        status: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getShareableCertificateByVerificationCode)('P-SOMECODE');

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with verification code "P-SOMECODE"');
    });

    it('should throw a NotFoundError when certificate is rejected', async function () {
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
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
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
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: shareableCertificateData.pixScore,
        status: 'rejected',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getShareableCertificateByVerificationCode)('P-SOMECODE');

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with verification code "P-SOMECODE"');
    });

    describe('when "locale" is french', function () {
      it('should return a french ShareableCertificate', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const shareableCertificateData = {
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

        const { certificationCourseId, assessmentResultId } = await _buildValidShareableCertificate(
          shareableCertificateData,
          false,
        );

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
          competences: [competence1, competence2],
          title: 'titre test',
          framework: null,
        });

        const learningContentObjects = learningContentBuilder.fromAreas([
          {
            ...area1,
            title_i18n: { fr: area1.title, en: 'title en' },
            competences: [
              {
                id: 'recComp1',
                index: '1.1',
                name_i18n: { fr: 'Traiter des données', en: 'Process data' },
                description_i18n: { fr: 'competence1DescriptionFr', en: 'competence1DescriptionEn' },
              },
              {
                id: 'recComp2',
                index: '1.2',
                name_i18n: { fr: 'Traiter des choux', en: 'Process sprouts' },
                description_i18n: { fr: 'competence2DescriptionFr', en: 'competence2DescriptionEn' },
              },
            ],
          },
        ]);
        mockLearningContent(learningContentObjects);

        // when
        const shareableCertificate = await certificateRepository.getShareableCertificateByVerificationCode(
          'P-SOMECODE',
          {
            locale: 'fr',
          },
        );

        // then
        const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({
          id: `${certificationCourseId}-${assessmentResultId}`,
          competenceMarks: [competenceMarks1, competenceMarks2],
          competenceTree: domainBuilder.buildCompetenceTree({ areas: [area1] }),
        });
        const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
          id: certificationCourseId,
          ...shareableCertificateData,
          resultCompetenceTree,
        });
        expect(shareableCertificate).to.deepEqualInstance(expectedShareableCertificate);
      });
    });

    describe('when "locale" is english', function () {
      it('should return an english ShareableCertificate', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const shareableCertificateData = {
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

        const { certificationCourseId, assessmentResultId } = await _buildValidShareableCertificate(
          shareableCertificateData,
          false,
        );

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
          competences: [competence1, competence2],
          title: 'titre test',
          framework: null,
        });

        const learningContentObjects = learningContentBuilder.fromAreas([
          {
            ...area1,
            title_i18n: { fr: area1.title, en: 'title en' },
            competences: [
              {
                id: 'recComp1',
                index: '1.1',
                name_i18n: { fr: 'Traiter des données', en: 'Process data' },
                description_i18n: { fr: 'competence1DescriptionFr', en: 'competence1DescriptionEn' },
              },
              {
                id: 'recComp2',
                index: '1.2',
                name_i18n: { fr: 'Traiter des choux', en: 'Process sprouts' },
                description_i18n: { fr: 'competence2DescriptionFr', en: 'competence2DescriptionEn' },
              },
            ],
          },
        ]);
        mockLearningContent(learningContentObjects);

        // when
        const shareableCertificate = await certificateRepository.getShareableCertificateByVerificationCode(
          'P-SOMECODE',
          {
            locale: 'en',
          },
        );

        // then
        const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({
          id: `${certificationCourseId}-${assessmentResultId}`,
          competenceMarks: [competenceMarks1, competenceMarks2],
          competenceTree: domainBuilder.buildCompetenceTree({
            areas: [
              {
                ...area1,
                title: 'title en',
                competences: [
                  { ...area1.competences[0], name: 'Process data' },
                  { ...area1.competences[1], name: 'Process sprouts' },
                ],
              },
            ],
          }),
        });
        const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
          id: certificationCourseId,
          ...shareableCertificateData,
          resultCompetenceTree,
        });
        expect(shareableCertificate).to.deepEqualInstance(expectedShareableCertificate);
      });
    });

    context('acquired certifiable badges', function () {
      it('should get the certified badge images when the certifications were acquired', async function () {
        // given
        const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Test',
          hasExternalJury: false,
        }).id;
        const complementaryCertificationWithJuryId = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Test 2',
          hasExternalJury: true,
        }).id;

        const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
        mockLearningContent(learningContentObjects);
        const userId = databaseBuilder.factory.buildUser().id;
        const shareableCertificateData = {
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
          certifiedBadgeImages: [
            {
              imageUrl: 'https://images.pix.fr/badge1.svg',
              stickerUrl: 'https://images.pix.fr/skicker1.pdf',
              isTemporaryBadge: false,
              label: 'Pix+ test',
              message: 'message badge 1',
              partnerKey: 'PIX_TEST_1',
            },
            {
              imageUrl: 'https://images.pix.fr/badge2.svg',
              stickerUrl: 'https://images.pix.fr/skicker2.pdf',
              isTemporaryBadge: true,
              label: 'Pix+ test',
              message: 'temporary message badge 2',
              partnerKey: 'PIX_TEST_2',
            },
          ],
        };

        const { certificationCourseId } = await _buildValidShareableCertificateWithAcquiredBadges({
          shareableCertificateData,
          acquiredBadges: [
            {
              key: 'PIX_TEST_1',
              imageUrl: 'https://images.pix.fr/badge1.svg',
              stickerUrl: 'https://images.pix.fr/skicker1.pdf',
              label: 'Pix+ test',
              complementaryCertificationId,
              certificateMessage: 'message badge 1',
            },
            {
              key: 'PIX_TEST_2',
              imageUrl: 'https://images.pix.fr/badge2.svg',
              stickerUrl: 'https://images.pix.fr/skicker2.pdf',
              label: 'Pix+ test',
              complementaryCertificationId: complementaryCertificationWithJuryId,
              temporaryCertificateMessage: 'temporary message badge 2',
            },
          ],
        });

        await databaseBuilder.commit();

        // when
        const shareableCertificate =
          await certificateRepository.getShareableCertificateByVerificationCode('P-SOMECODE');

        // then
        const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
          id: certificationCourseId,
          ...shareableCertificateData,
        });
        expect(shareableCertificate).to.deepEqualInstanceOmitting(expectedShareableCertificate, [
          'resultCompetenceTree',
        ]);
      });
    });
  });
});

async function _buildValidShareableCertificate(shareableCertificateData, buildCompetenceMark = true) {
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  const sessionId = databaseBuilder.factory.buildSession({
    id: shareableCertificateData.sessionId,
    publishedAt: shareableCertificateData.deliveredAt,
    certificationCenter: shareableCertificateData.certificationCenter,
    certificationCenterId,
  }).id;
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    id: shareableCertificateData.id,
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
    userId: shareableCertificateData.userId,
  }).id;

  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId: shareableCertificateData.id,
    pixScore: shareableCertificateData.pixScore,
    status: 'validated',
    createdAt: new Date('2020-01-02'),
  }).id;

  if (buildCompetenceMark) {
    databaseBuilder.factory.buildCompetenceMark({
      assessmentResultId,
    });
  }

  await databaseBuilder.commit();

  return { certificationCourseId, assessmentResultId };
}

async function _buildValidShareableCertificateWithAcquiredBadges({ shareableCertificateData, acquiredBadges }) {
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  const sessionId = databaseBuilder.factory.buildSession({
    publishedAt: shareableCertificateData.deliveredAt,
    certificationCenter: shareableCertificateData.certificationCenter,
    certificationCenterId,
  }).id;
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    id: shareableCertificateData.id,
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
    userId: shareableCertificateData.userId,
  }).id;
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId,
    pixScore: shareableCertificateData.pixScore,
    status: 'validated',
  }).id;

  acquiredBadges?.forEach(
    ({
      key,
      imageUrl,
      label,
      complementaryCertificationId,
      certificateMessage,
      temporaryCertificateMessage,
      stickerUrl,
    }) => {
      const badgeId = databaseBuilder.factory.buildBadge({ key }).id;

      const complementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId,
        complementaryCertificationId,
        imageUrl,
        stickerUrl,
        label,
        certificateMessage,
        temporaryCertificateMessage,
      }).id;
      const { id: complementaryCertificationCourseId } = databaseBuilder.factory.buildComplementaryCertificationCourse({
        certificationCourseId,
        complementaryCertificationId,
        complementaryCertificationBadgeId,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId,
        complementaryCertificationBadgeId,
        acquired: true,
      });
    },
  );

  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId,
  });
  await databaseBuilder.commit();
  return { certificationCourseId };
}
