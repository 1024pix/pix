const {
  expect,
  databaseBuilder,
  domainBuilder,
  catchErr,
  learningContentBuilder,
  mockLearningContent,
} = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const shareableCertificateRepository = require('../../../../lib/infrastructure/repositories/shareable-certificate-repository');
const ComplementaryCertificationCourseResult = require('../../../../lib/domain/models/ComplementaryCertificationCourseResult');
const {
  PIX_EMPLOI_CLEA_V1,
  PIX_EMPLOI_CLEA_V2,
  PIX_EMPLOI_CLEA_V3,
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
} = require('../../../../lib/domain/models/Badge').keys;

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

  let pixCleaComplementaryCertificationId, pixDroitComplementaryCertificationId, pixEduComplementaryCertificationId;

  beforeEach(async function () {
    pixDroitComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
      name: 'PIX+ Droit',
    }).id;
    pixEduComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
      name: 'PIX+ Edu',
    }).id;
    pixCleaComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
      name: 'CLEA',
    }).id;

    await databaseBuilder.commit();
  });

  describe('#getByVerificationCode', function () {
    it('should throw a NotFoundError when shareable certificate does not exist', async function () {
      // when
      const error = await catchErr(shareableCertificateRepository.getByVerificationCode)('P-SOMECODE');

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
      databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(shareableCertificateRepository.getByVerificationCode)('P-SOMECODE');

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
      const error = await catchErr(shareableCertificateRepository.getByVerificationCode)('P-SOMECODE');

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
      const error = await catchErr(shareableCertificateRepository.getByVerificationCode)('P-SOMECODE');

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
      const error = await catchErr(shareableCertificateRepository.getByVerificationCode)('P-SOMECODE');

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
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        };

        const { certificateId, assessmentResultId } = await _buildValidShareableCertificate(
          shareableCertificateData,
          false
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
        });

        const learningContentObjects = learningContentBuilder.buildLearningContent([
          {
            ...area1,
            titleFr: area1.title,
            titleEn: 'title en',
            competences: [
              {
                id: 'recComp1',
                index: '1.1',
                nameFr: 'Traiter des données',
                nameEn: 'Process data',
                descriptionFr: 'competence1DescriptionFr',
                descriptionEn: 'competence1DescriptionEn',
              },
              {
                id: 'recComp2',
                index: '1.2',
                nameFr: 'Traiter des choux',
                nameEn: 'Process sprouts',
                descriptionFr: 'competence2DescriptionFr',
                descriptionEn: 'competence2DescriptionEn',
              },
            ],
          },
        ]);
        mockLearningContent(learningContentObjects);

        // when
        const shareableCertificate = await shareableCertificateRepository.getByVerificationCode('P-SOMECODE', {
          locale: 'fr',
        });

        // then
        const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({
          id: `${certificateId}-${assessmentResultId}`,
          competenceMarks: [competenceMarks1, competenceMarks2],
          competenceTree: domainBuilder.buildCompetenceTree({ areas: [area1] }),
        });
        const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
          id: certificateId,
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
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        };

        const { certificateId, assessmentResultId } = await _buildValidShareableCertificate(
          shareableCertificateData,
          false
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
        });

        const learningContentObjects = learningContentBuilder.buildLearningContent([
          {
            ...area1,
            titleFr: area1.title,
            titleEn: 'title en',
            competences: [
              {
                id: 'recComp1',
                index: '1.1',
                nameFr: 'Traiter des données',
                nameEn: 'Process data',
                descriptionFr: 'competence1DescriptionFr',
                descriptionEn: 'competence1DescriptionEn',
              },
              {
                id: 'recComp2',
                index: '1.2',
                nameFr: 'Traiter des choux',
                nameEn: 'Process sprouts',
                descriptionFr: 'competence2DescriptionFr',
                descriptionEn: 'competence2DescriptionEn',
              },
            ],
          },
        ]);
        mockLearningContent(learningContentObjects);

        // when
        const shareableCertificate = await shareableCertificateRepository.getByVerificationCode('P-SOMECODE', {
          locale: 'en',
        });

        // then
        const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({
          id: `${certificateId}-${assessmentResultId}`,
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
          id: certificateId,
          ...shareableCertificateData,
          resultCompetenceTree,
        });
        expect(shareableCertificate).to.deepEqualInstance(expectedShareableCertificate);
      });
    });

    it('should get the clea certification result if taken with badge V1', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
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
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.acquired(),
      };

      const { certificateId } = await _buildValidShareableCertificateWithAcquiredAndNotAcquiredBadges({
        shareableCertificateData,
        acquiredBadges: [
          {
            key: PIX_EMPLOI_CLEA_V1,
            complementaryCertificationId: pixCleaComplementaryCertificationId,
            imageUrl: 'https://images.pix.fr/badges-certifies/clea.svg',
          },
        ],
        notAcquiredBadges: [],
      });

      // when
      const shareableCertificate = await shareableCertificateRepository.getByVerificationCode('P-SOMECODE');

      // then
      const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
        id: certificateId,
        ...shareableCertificateData,
      });
      expect(shareableCertificate).to.deepEqualInstanceOmitting(expectedShareableCertificate, ['resultCompetenceTree']);
    });

    it('should get the clea certification result if taken with badge V2', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
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
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.acquired(),
      };

      const { certificateId } = await _buildValidShareableCertificateWithAcquiredAndNotAcquiredBadges({
        shareableCertificateData,
        acquiredBadges: [
          {
            key: PIX_EMPLOI_CLEA_V2,
            complementaryCertificationId: pixCleaComplementaryCertificationId,
            imageUrl: 'https://images.pix.fr/badges-certifies/clea.svg',
          },
        ],
        notAcquiredBadges: [],
      });

      // when
      const shareableCertificate = await shareableCertificateRepository.getByVerificationCode('P-SOMECODE');

      // then
      const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
        id: certificateId,
        ...shareableCertificateData,
      });
      expect(shareableCertificate).to.deepEqualInstanceOmitting(expectedShareableCertificate, ['resultCompetenceTree']);
    });

    it('should get the clea certification result if taken with badge V3', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
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
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.acquired(),
      };

      const { certificateId } = await _buildValidShareableCertificateWithAcquiredAndNotAcquiredBadges({
        shareableCertificateData,
        acquiredBadges: [
          {
            key: PIX_EMPLOI_CLEA_V3,
            complementaryCertificationId: pixCleaComplementaryCertificationId,
            imageUrl: 'https://images.pix.fr/badges-certifies/clea.svg',
          },
        ],
        notAcquiredBadges: [],
      });

      // when
      const shareableCertificate = await shareableCertificateRepository.getByVerificationCode('P-SOMECODE');

      // then
      const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
        id: certificateId,
        ...shareableCertificateData,
      });
      expect(shareableCertificate).to.deepEqualInstanceOmitting(expectedShareableCertificate, ['resultCompetenceTree']);
    });

    context('acquired certifiable badges', function () {
      it('should get the certified badge images of pixPlusDroitMaitre and/or pixPlusDroitExpert when those certifications were acquired', async function () {
        // given
        const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
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
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
          certifiedBadgeImages: [
            domainBuilder.buildCertifiedBadgeImage.notTemporary({
              path: 'https://images.pix.fr/badges-certifies/pix-droit/expert.svg',
            }),
            domainBuilder.buildCertifiedBadgeImage.notTemporary({
              path: 'https://images.pix.fr/badges-certifies/pix-droit/maitre.svg',
            }),
          ],
        };

        const { certificateId } = await _buildValidShareableCertificateWithAcquiredAndNotAcquiredBadges({
          shareableCertificateData,
          acquiredBadges: [
            {
              key: PIX_DROIT_EXPERT_CERTIF,
              imageUrl: 'https://images.pix.fr/badges-certifies/pix-droit/expert.svg',
              complementaryCertificationId: pixDroitComplementaryCertificationId,
            },
            {
              key: PIX_DROIT_MAITRE_CERTIF,
              imageUrl: 'https://images.pix.fr/badges-certifies/pix-droit/maitre.svg',
              complementaryCertificationId: pixDroitComplementaryCertificationId,
            },
          ],
          notAcquiredBadges: [],
        });

        // when
        const shareableCertificate = await shareableCertificateRepository.getByVerificationCode('P-SOMECODE');

        // then
        const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
          id: certificateId,
          ...shareableCertificateData,
        });
        expect(shareableCertificate).to.deepEqualInstanceOmitting(expectedShareableCertificate, [
          'resultCompetenceTree',
        ]);
      });

      it('should get the certified badge image when there is temporary partner key and no partner key', async function () {
        // given
        const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
        mockLearningContent(learningContentObjects);

        const userId = databaseBuilder.factory.buildUser().id;
        const shareableCertificateData = {
          firstName: 'Sarah Michelle',
          lastName: 'Gellar',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          userId,
          date: new Date('2020-01-01'),
          verificationCode: 'ABCDF-G',
          maxReachableLevelOnCertificationDate: 5,
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: null,
          commentForCandidate: null,
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
          certifiedBadgeImages: [
            domainBuilder.buildCertifiedBadgeImage.temporary({
              path: 'https://images.pix.fr/badges/Pix_plus_Edu-1-Initie-certif.svg',
              levelName: 'Initié (entrée dans le métier)',
              message:
                'Vous avez obtenu le niveau “Initié (entrée dans le métier)” dans le cadre du volet 1 de la certification Pix+Édu. Votre niveau final sera déterminé à l’issue du volet 2',
            }),
          ],
        };

        const { certificateId } = await _buildValidShareableCertificateWithAcquiredAndNotAcquiredBadges({
          shareableCertificateData,
          temporaryAcquiredBadges: [
            {
              key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
              imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-1-Initie-certif.svg',
              complementaryCertificationId: pixEduComplementaryCertificationId,
            },
          ],
          acquiredBadges: [],
          notAcquiredBadges: [],
        });

        // when
        const shareableCertificate = await shareableCertificateRepository.getByVerificationCode(
          shareableCertificateData.verificationCode
        );

        // then
        const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
          id: certificateId,
          ...shareableCertificateData,
        });

        expect(shareableCertificate.certifiedBadgeImages).to.deep.equal(
          expectedShareableCertificate.certifiedBadgeImages
        );
      });

      it('should only take into account acquired ones', async function () {
        // given
        const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
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
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
          certifiedBadgeImages: [
            domainBuilder.buildCertifiedBadgeImage.notTemporary({
              path: 'https://images.pix.fr/badges-certifies/pix-droit/expert.svg',
            }),
          ],
        };

        const { certificateId } = await _buildValidShareableCertificateWithAcquiredAndNotAcquiredBadges({
          shareableCertificateData,
          acquiredBadges: [
            {
              key: PIX_DROIT_EXPERT_CERTIF,
              imageUrl: 'https://images.pix.fr/badges-certifies/pix-droit/expert.svg',
              complementaryCertificationId: pixDroitComplementaryCertificationId,
            },
          ],
          notAcquiredBadges: [],
        });

        const otherCertificateId = databaseBuilder.factory.buildCertificationCourse().id;
        databaseBuilder.factory.buildBadge({ key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE });
        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          certificationCourseId: otherCertificateId,
          partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
          acquired: true,
          source: ComplementaryCertificationCourseResult.sources.PIX,
        });
        await databaseBuilder.commit();

        // when
        const shareableCertificate = await shareableCertificateRepository.getByVerificationCode('P-SOMECODE');

        // then
        const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
          id: certificateId,
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
  const certificateId = databaseBuilder.factory.buildCertificationCourse({
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
  const assessmentId = databaseBuilder.factory.buildAssessment({
    certificationCourseId: shareableCertificateData.id,
  }).id;
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
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

  return { certificateId, assessmentResultId };
}

async function _buildValidShareableCertificateWithAcquiredAndNotAcquiredBadges({
  shareableCertificateData,
  acquiredBadges,
  notAcquiredBadges,
  temporaryAcquiredBadges,
}) {
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  const sessionId = databaseBuilder.factory.buildSession({
    publishedAt: shareableCertificateData.deliveredAt,
    certificationCenter: shareableCertificateData.certificationCenter,
    certificationCenterId,
  }).id;
  const certificateId = databaseBuilder.factory.buildCertificationCourse({
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
  const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId }).id;
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: shareableCertificateData.pixScore,
    status: 'validated',
  }).id;

  acquiredBadges?.forEach(({ key, imageUrl, complementaryCertificationId }) => {
    const badgeId = databaseBuilder.factory.buildBadge({ key }).id;
    const { id: complementaryCertificationCourseId } = databaseBuilder.factory.buildComplementaryCertificationCourse({
      certificationCourseId: certificateId,
      complementaryCertificationId,
    });
    databaseBuilder.factory.buildComplementaryCertificationCourseResult({
      complementaryCertificationCourseId,
      partnerKey: key,
      acquired: true,
    });

    databaseBuilder.factory.buildComplementaryCertificationBadge({
      badgeId,
      complementaryCertificationId,
      imageUrl,
    });
  });
  temporaryAcquiredBadges?.forEach(({ key, imageUrl, complementaryCertificationId }) => {
    const badgeId = databaseBuilder.factory.buildBadge({ key }).id;
    const { id: complementaryCertificationCourseId } = databaseBuilder.factory.buildComplementaryCertificationCourse({
      certificationCourseId: certificateId,
      complementaryCertificationId,
    });
    databaseBuilder.factory.buildComplementaryCertificationCourseResult({
      complementaryCertificationCourseId,
      partnerKey: key,
      acquired: true,
      source: ComplementaryCertificationCourseResult.sources.PIX,
    });
    databaseBuilder.factory.buildComplementaryCertificationBadge({
      badgeId,
      complementaryCertificationId,
      imageUrl,
    });
  });

  notAcquiredBadges.forEach(({ key, imageUrl, complementaryCertificationId }) => {
    const badgeId = databaseBuilder.factory.buildBadge({ key }).id;
    const { id: complementaryCertificationCourseId } = databaseBuilder.factory.buildComplementaryCertificationCourse({
      certificationCourseId: certificateId,
      complementaryCertificationId,
    });
    databaseBuilder.factory.buildComplementaryCertificationCourseResult({
      complementaryCertificationCourseId,
      partnerKey: key,
      acquired: false,
    });

    databaseBuilder.factory.buildComplementaryCertificationBadge({
      badgeId,
      complementaryCertificationId,
      imageUrl,
    });
  });

  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId,
  });
  await databaseBuilder.commit();
  return { certificateId };
}
