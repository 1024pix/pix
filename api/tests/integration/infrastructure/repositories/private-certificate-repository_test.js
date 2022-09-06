const {
  expect,
  databaseBuilder,
  domainBuilder,
  catchErr,
  learningContentBuilder,
  mockLearningContent,
} = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const privateCertificateRepository = require('../../../../lib/infrastructure/repositories/private-certificate-repository');
const PrivateCertificate = require('../../../../lib/domain/models/PrivateCertificate');
const {
  PIX_EMPLOI_CLEA_V1,
  PIX_EMPLOI_CLEA_V2,
  PIX_EMPLOI_CLEA_V3,
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
} = require('../../../../lib/domain/models/Badge').keys;
const _ = require('lodash');
const ComplementaryCertificationCourseResult = require('../../../../lib/domain/models/ComplementaryCertificationCourseResult');

describe('Integration | Infrastructure | Repository | Private Certificate', function () {
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

  let pixDroitComplementaryCertificationId, pixEduComplementaryCertificationId;

  beforeEach(async function () {
    pixDroitComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
      name: 'PIX+ Droit',
    }).id;
    pixEduComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
      name: 'PIX+ Edu',
    }).id;

    await databaseBuilder.commit();
  });

  describe('#get', function () {
    it('should throw a NotFoundError when private certificate does not exist', async function () {
      // when
      const error = await catchErr(privateCertificateRepository.get)(123, { locale: 'fr' });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('Certificate not found for ID 123');
    });

    it('should return a PrivateCertificate', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);

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
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
      };

      const { certificateId } = await _buildValidPrivateCertificate(privateCertificateData);

      // when
      const privateCertificate = await privateCertificateRepository.get(certificateId);

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
        id: certificateId,
        ...privateCertificateData,
      });
      expect(privateCertificate).to.deepEqualInstanceOmitting(expectedPrivateCertificate, ['resultCompetenceTree']);
    });

    describe('when "locale" is french', function () {
      it('should return a PrivateCertificate with french resultCompetenceTree', async function () {
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
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        };

        const { certificateId, assessmentResultId } = await _buildValidPrivateCertificate(
          privateCertificateData,
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
          title: 'titre test',
          competences: [competence1, competence2],
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
        const privateCertificate = await privateCertificateRepository.get(certificateId, { locale: 'fr' });

        // then
        const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({
          id: `${certificateId}-${assessmentResultId}`,
          competenceMarks: [competenceMarks1, competenceMarks2],
          competenceTree: domainBuilder.buildCompetenceTree({ areas: [area1] }),
        });
        const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
          id: certificateId,
          resultCompetenceTree,
          ...privateCertificateData,
        });
        expect(privateCertificate).to.be.instanceOf(PrivateCertificate);
        expect(privateCertificate).to.deep.equal(expectedPrivateCertificate);
      });
    });

    describe('when "locale" is english', function () {
      it('should return a PrivateCertificate with english resultCompetenceTree', async function () {
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
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        };

        const { certificateId, assessmentResultId } = await _buildValidPrivateCertificate(
          privateCertificateData,
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
          title: 'titre test',
          competences: [competence1, competence2],
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
        const privateCertificate = await privateCertificateRepository.get(certificateId, { locale: 'en' });

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
        const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
          id: certificateId,
          resultCompetenceTree,
          ...privateCertificateData,
        });
        expect(privateCertificate).to.deepEqualInstance(expectedPrivateCertificate);
      });
    });

    it('should build from the latest assessment result if any', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);

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
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
      };

      const { certificateId } = await _buildValidPrivateCertificateWithSeveralResults(privateCertificateData);

      // when
      const privateCertificate = await privateCertificateRepository.get(certificateId);

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.rejected({
        id: certificateId,
        ...privateCertificateData,
      });
      expect(_.omit(privateCertificate, ['resultCompetenceTree'])).to.deep.equal(
        _.omit(expectedPrivateCertificate, ['resultCompetenceTree'])
      );
    });

    it('should build even if there is not assessment result', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);

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
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
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
      expect(privateCertificate).to.deepEqualInstanceOmitting(expectedPrivateCertificate, ['resultCompetenceTree']);
    });

    it('should get the clea certification result if taken with badge V1', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);
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
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.acquired(),
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
      databaseBuilder.factory.buildBadge({ key: PIX_EMPLOI_CLEA_V1 });
      databaseBuilder.factory.buildComplementaryCertificationCourse({ id: 998, certificationCourseId: certificateId });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 998,
        partnerKey: PIX_EMPLOI_CLEA_V1,
        acquired: true,
      });
      await databaseBuilder.commit();

      // when
      const privateCertificate = await privateCertificateRepository.get(certificateId);

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.started({
        id: certificateId,
        ...privateCertificateData,
      });
      expect(privateCertificate).to.deepEqualInstanceOmitting(expectedPrivateCertificate, ['resultCompetenceTree']);
    });

    it('should get the clea certification result if taken with badge V2', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);
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
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.acquired(),
      };

      const { certificateId } = await _buildValidPrivateCertificate(privateCertificateData);

      databaseBuilder.factory.buildBadge({ key: PIX_EMPLOI_CLEA_V2 });
      databaseBuilder.factory.buildComplementaryCertificationCourse({ id: 998, certificationCourseId: certificateId });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 998,
        partnerKey: PIX_EMPLOI_CLEA_V2,
        acquired: true,
      });
      await databaseBuilder.commit();

      // when
      const privateCertificate = await privateCertificateRepository.get(certificateId);

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
        id: certificateId,
        ...privateCertificateData,
      });
      expect(privateCertificate).to.deepEqualInstanceOmitting(expectedPrivateCertificate, ['resultCompetenceTree']);
    });

    it('should get the clea certification result if taken with badge V3', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);
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
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.acquired(),
      };

      const { certificateId } = await _buildValidPrivateCertificate(privateCertificateData);

      databaseBuilder.factory.buildBadge({ key: PIX_EMPLOI_CLEA_V3 });
      databaseBuilder.factory.buildComplementaryCertificationCourse({ id: 998, certificationCourseId: certificateId });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 998,
        partnerKey: PIX_EMPLOI_CLEA_V3,
        acquired: true,
      });
      await databaseBuilder.commit();

      // when
      const privateCertificate = await privateCertificateRepository.get(certificateId);

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
        id: certificateId,
        ...privateCertificateData,
      });
      expect(privateCertificate).to.deepEqualInstanceOmitting(expectedPrivateCertificate, ['resultCompetenceTree']);
    });

    context('acquired certifiable badges', function () {
      it('should get the certified badge image of pixPlusDroitExpert when this certification was acquired', async function () {
        // given
        const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
        mockLearningContent(learningContentObjects);

        const userId = databaseBuilder.factory.buildUser().id;
        const privateCertificateData = {
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
            domainBuilder.buildCertifiedBadgeImage.notTemporary({
              path: 'https://images.pix.fr/badges-certifies/pix-droit/expert.svg',
            }),
          ],
        };

        const { certificateId } = await _buildValidPrivateCertificateWithAcquiredAndNotAcquiredBadges({
          privateCertificateData,
          acquiredBadges: [
            {
              key: PIX_DROIT_EXPERT_CERTIF,
              imageUrl: 'https://images.pix.fr/badges-certifies/pix-droit/expert.svg',
              complementaryCertificationId: pixDroitComplementaryCertificationId,
            },
          ],
          notAcquiredBadges: [
            {
              key: PIX_DROIT_MAITRE_CERTIF,
              imageUrl: 'https://images.pix.fr/badges-certifies/pix-droit/maitre.svg',
              complementaryCertificationId: pixDroitComplementaryCertificationId,
            },
          ],
        });

        // when
        const privateCertificate = await privateCertificateRepository.get(certificateId);

        // then
        const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.started({
          id: certificateId,
          ...privateCertificateData,
        });

        expect(privateCertificate).to.deepEqualInstanceOmitting(expectedPrivateCertificate, ['resultCompetenceTree']);
      });

      it('should only take into account acquired ones', async function () {
        // given
        const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
        mockLearningContent(learningContentObjects);

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
          cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
          certifiedBadgeImages: [
            domainBuilder.buildCertifiedBadgeImage.notTemporary({
              path: 'https://images.pix.fr/badges-certifies/pix-droit/expert.svg',
            }),
          ],
        };

        const { certificateId } = await _buildValidPrivateCertificateWithAcquiredAndNotAcquiredBadges({
          privateCertificateData,
          acquiredBadges: [
            {
              key: PIX_DROIT_EXPERT_CERTIF,
              imageUrl: 'https://images.pix.fr/badges-certifies/pix-droit/expert.svg',
              complementaryCertificationId: pixDroitComplementaryCertificationId,
            },
          ],
          notAcquiredBadges: [
            {
              key: PIX_DROIT_MAITRE_CERTIF,
              imageUrl: 'https://images.pix.fr/badges-certifies/pix-droit/maitre.svg',
              complementaryCertificationId: pixDroitComplementaryCertificationId,
            },
          ],
        });

        // when
        const privateCertificate = await privateCertificateRepository.get(certificateId);

        // then
        const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.started({
          id: certificateId,
          ...privateCertificateData,
        });

        expect(privateCertificate).to.deepEqualInstanceOmitting(expectedPrivateCertificate, ['resultCompetenceTree']);
      });
    });

    it('should get the certified badge image of pixPlusDroitMaitre when this certifications was acquired', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);

      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
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
          domainBuilder.buildCertifiedBadgeImage.notTemporary({
            path: 'https://images.pix.fr/badges-certifies/pix-droit/maitre.svg',
          }),
        ],
      };

      const { certificateId } = await _buildValidPrivateCertificateWithAcquiredAndNotAcquiredBadges({
        privateCertificateData,
        acquiredBadges: [
          {
            key: PIX_DROIT_MAITRE_CERTIF,
            imageUrl: 'https://images.pix.fr/badges-certifies/pix-droit/maitre.svg',
            complementaryCertificationId: pixDroitComplementaryCertificationId,
          },
        ],
        notAcquiredBadges: [
          {
            key: PIX_DROIT_EXPERT_CERTIF,
            imageUrl: 'https://images.pix.fr/badges-certifies/pix-droit/expert.svg',
            complementaryCertificationId: pixDroitComplementaryCertificationId,
          },
        ],
      });

      await _buildValidPrivateCertificateWithAcquiredAndNotAcquiredBadges({
        privateCertificateData: {},
        acquiredBadges: [],
        notAcquiredBadges: [],
        temporaryAcquiredBadges: [
          {
            key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
            imageUrl: 'https://images.pix.fr/badges-certifies/pix-droit/maitre.svg',
            complementaryCertificationId: pixDroitComplementaryCertificationId,
          },
        ],
      });

      // when
      const privateCertificate = await privateCertificateRepository.get(certificateId);

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.started({
        id: certificateId,
        ...privateCertificateData,
      });

      expect(privateCertificate.certifiedBadgeImages).to.deep.equal(expectedPrivateCertificate.certifiedBadgeImages);
    });

    it('should get the certified badge images of pixPlusDroitMaitre and pixPlusDroitExpert when those certifications were acquired', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);

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

      const { certificateId } = await _buildValidPrivateCertificateWithAcquiredAndNotAcquiredBadges({
        privateCertificateData,
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
      const privateCertificate = await privateCertificateRepository.get(certificateId);

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.started({
        id: certificateId,
        ...privateCertificateData,
      });

      expect(privateCertificate).to.deepEqualInstanceOmitting(expectedPrivateCertificate, ['resultCompetenceTree']);
    });

    it('should get the certified badge image when there is temporary partner key and no partner key', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);

      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
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

      const { certificateId } = await _buildValidPrivateCertificateWithAcquiredAndNotAcquiredBadges({
        privateCertificateData,
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
      const privateCertificate = await privateCertificateRepository.get(certificateId);

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.started({
        id: certificateId,
        ...privateCertificateData,
      });

      expect(privateCertificate).to.deepEqualInstanceOmitting(expectedPrivateCertificate, ['resultCompetenceTree']);
    });
  });

  describe('#findByUserId', function () {
    it('should return a collection of PrivateCertificate', async function () {
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
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
      };

      const { certificateId } = await _buildValidPrivateCertificate(privateCertificateData);
      // when
      const privateCertificates = await privateCertificateRepository.findByUserId({ userId });

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
        id: certificateId,
        ...privateCertificateData,
      });
      expect(privateCertificates).to.have.length(1);
      expect(privateCertificates[0]).to.be.instanceOf(PrivateCertificate);
      expect(privateCertificates[0]).to.deep.equal(expectedPrivateCertificate);
    });

    it('should return all the certificates of the user if he has many ordered by creation date DESC', async function () {
      // given

      const userId = databaseBuilder.factory.buildUser().id;
      const anotherUserId = databaseBuilder.factory.buildUser().id;
      const sessionId1 = databaseBuilder.factory.buildSession().id;
      const sessionId2 = databaseBuilder.factory.buildSession().id;
      const sessionId3 = databaseBuilder.factory.buildSession().id;
      const certificateId1 = databaseBuilder.factory.buildCertificationCourse({
        sessionId: sessionId1,
        createdAt: new Date('2020-01-01'),
        userId,
      }).id;
      const certificateId2 = databaseBuilder.factory.buildCertificationCourse({
        sessionId: sessionId2,
        createdAt: new Date('2020-02-01'),
        userId,
      }).id;
      const anotherUserCertificateId = databaseBuilder.factory.buildCertificationCourse({
        sessionId: sessionId3,
        createdAt: new Date('2020-03-01'),
        userId: anotherUserId,
      }).id;
      databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId1 });
      databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId2 });
      databaseBuilder.factory.buildAssessment({ certificationCourseId: anotherUserCertificateId });
      await databaseBuilder.commit();

      // when
      const privateCertificates = await privateCertificateRepository.findByUserId({ userId });

      // then
      expect(privateCertificates).to.have.length(2);
      expect(privateCertificates[0].id).to.equal(certificateId2);
      expect(privateCertificates[1].id).to.equal(certificateId1);
    });

    it('should build from the latest assessment result if any', async function () {
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
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
      };

      const { certificateId } = await _buildValidPrivateCertificateWithSeveralResults(privateCertificateData);

      // when
      const privateCertificates = await privateCertificateRepository.findByUserId({ userId });

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.rejected({
        id: certificateId,
        ...privateCertificateData,
      });
      expect(privateCertificates[0]).to.deep.equal(expectedPrivateCertificate);
    });

    it('should build even if there is not assessment result', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent(minimalLearningContent);
      mockLearningContent(learningContentObjects);
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
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
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
      const privateCertificates = await privateCertificateRepository.findByUserId({ userId });

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.started({
        id: certificateId,
        ...privateCertificateData,
      });
      expect(privateCertificates[0]).to.deepEqualInstanceOmitting(expectedPrivateCertificate, ['resultCompetenceTree']);
    });

    it('should get the clea certification result if taken', async function () {
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
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.acquired(),
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
      databaseBuilder.factory.buildBadge({ key: PIX_EMPLOI_CLEA_V1 });
      databaseBuilder.factory.buildComplementaryCertificationCourse({ id: 998, certificationCourseId: certificateId });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 998,
        partnerKey: PIX_EMPLOI_CLEA_V1,
        acquired: true,
      });
      await databaseBuilder.commit();

      // when
      const privateCertificates = await privateCertificateRepository.findByUserId({ userId });

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.started({
        id: certificateId,
        ...privateCertificateData,
      });
      expect(privateCertificates[0]).to.deep.equal(expectedPrivateCertificate);
    });
  });
});

async function _buildValidPrivateCertificate(privateCertificateData, buildCompetenceMark = true) {
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
    userId: privateCertificateData.userId,
  }).id;
  const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId }).id;
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: privateCertificateData.pixScore,
    status: 'validated',
    commentForCandidate: privateCertificateData.commentForCandidate,
    createdAt: new Date('2021-01-01'),
  }).id;

  if (buildCompetenceMark) {
    databaseBuilder.factory.buildCompetenceMark({
      assessmentResultId,
    });
  }

  await databaseBuilder.commit();

  return { certificateId, assessmentResultId, assessmentId };
}

async function _buildValidPrivateCertificateWithAcquiredAndNotAcquiredBadges({
  privateCertificateData,
  acquiredBadges,
  notAcquiredBadges,
  temporaryAcquiredBadges,
}) {
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
    userId: privateCertificateData.userId,
  }).id;
  const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId }).id;
  databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: privateCertificateData.pixScore,
    status: 'started',
    commentForCandidate: privateCertificateData.commentForCandidate,
    createdAt: new Date('2021-01-01'),
  });

  acquiredBadges?.forEach(({ key, imageUrl, complementaryCertificationId }) => {
    const badgeId = databaseBuilder.factory.buildBadge({ key }).id;
    const acquiredComplementaryBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
      badgeId,
      complementaryCertificationId,
      imageUrl,
    }).id;
    const { id: complementaryCertificationCourseId } = databaseBuilder.factory.buildComplementaryCertificationCourse({
      certificationCourseId: certificateId,
      complementaryCertificationId,
      complementaryCertificationBadgeId: acquiredComplementaryBadgeId,
    });
    databaseBuilder.factory.buildComplementaryCertificationCourseResult({
      complementaryCertificationCourseId,
      partnerKey: key,
      acquired: true,
    });
  });
  temporaryAcquiredBadges?.forEach(({ key, imageUrl, complementaryCertificationId }) => {
    databaseBuilder.factory.buildBadge({ key, id: 100 });
    const temporaryAcquiredComplementaryBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
      badgeId: 100,
      complementaryCertificationId,
      imageUrl,
    }).id;
    const { id: complementaryCertificationCourseId } = databaseBuilder.factory.buildComplementaryCertificationCourse({
      certificationCourseId: certificateId,
      complementaryCertificationId,
      complementaryCertificationBadgeId: temporaryAcquiredComplementaryBadgeId,
    });
    databaseBuilder.factory.buildComplementaryCertificationCourseResult({
      complementaryCertificationCourseId,
      partnerKey: key,
      acquired: true,
      source: ComplementaryCertificationCourseResult.sources.PIX,
    });
  });

  notAcquiredBadges.forEach(({ key, imageUrl, complementaryCertificationId }) => {
    databaseBuilder.factory.buildBadge({ key, id: 101 });
    const notAquiredComplementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
      badgeId: 101,
      complementaryCertificationId,
      imageUrl,
    }).id;
    const { id: complementaryCertificationCourseId } = databaseBuilder.factory.buildComplementaryCertificationCourse({
      certificationCourseId: certificateId,
      complementaryCertificationId,
      complementaryCertificationBadgeId: notAquiredComplementaryCertificationBadgeId,
    });
    databaseBuilder.factory.buildComplementaryCertificationCourseResult({
      complementaryCertificationCourseId,
      partnerKey: key,
      acquired: false,
    });
  });
  await databaseBuilder.commit();
  return { certificateId };
}

async function _buildValidPrivateCertificateWithSeveralResults(privateCertificateData) {
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
    userId: privateCertificateData.userId,
  }).id;
  const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificateId }).id;
  const assessmentResult1Id = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: privateCertificateData.pixScore,
    status: 'validated',
    commentForCandidate: privateCertificateData.commentForCandidate,
    createdAt: new Date('2021-01-01'),
  }).id;

  databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: privateCertificateData.pixScore,
    status: 'rejected',
    commentForCandidate: privateCertificateData.commentForCandidate,
    createdAt: new Date('2021-03-01'),
  });

  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId: assessmentResult1Id,
  });

  await databaseBuilder.commit();

  return { certificateId };
}
