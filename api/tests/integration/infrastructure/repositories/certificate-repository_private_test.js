const {
  expect,
  databaseBuilder,
  domainBuilder,
  catchErr,
  learningContentBuilder,
  mockLearningContent,
} = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const certificateRepository = require('../../../../lib/infrastructure/repositories/certificate-repository');

describe('Integration | Infrastructure | Repository | Certificate_private', function () {
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

  describe('#getPrivateCertificate', function () {
    it('should throw a NotFoundError when private certificate does not exist', async function () {
      // when
      const error = await catchErr(certificateRepository.getPrivateCertificate)(123, { locale: 'fr' });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('Certificate not found for ID 123');
    });

    it('should throw a NotFoundError when the certificate has no assessment-result', async function () {
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
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        commentForCandidate: 'Il aime beaucoup les mangues, et ça se voit !',
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
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
      databaseBuilder.factory.buildAssessment({ certificationCourseId });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getPrivateCertificate)(certificationCourseId, {
        locale: 'fr',
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`Certificate not found for ID ${certificationCourseId}`);
    });

    it('should throw a NotFoundError when the certificate is cancelled', async function () {
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
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        commentForCandidate: 'Il aime beaucoup les mangues, et ça se voit !',
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: privateCertificateData.isPublished,
        isCancelled: true,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      databaseBuilder.factory.buildAssessmentResult({
        certificationCourseId,
        pixScore: privateCertificateData.pixScore,
        status: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getPrivateCertificate)(certificationCourseId, {
        locale: 'fr',
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`Certificate not found for ID ${certificationCourseId}`);
    });

    it('should throw a NotFoundError when the certificate is not published', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isCancelled: false,
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
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: false,
        isCancelled: privateCertificateData.isCancelled,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId,
        pixScore: privateCertificateData.pixScore,
        status: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getPrivateCertificate)(certificationCourseId, {
        locale: 'fr',
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`Certificate not found for ID ${certificationCourseId}`);
    });

    it('should throw a NotFoundError when the certificate is rejected', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isCancelled: false,
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
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: privateCertificateData.isPublished,
        isCancelled: privateCertificateData.isCancelled,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId,
        pixScore: privateCertificateData.pixScore,
        status: 'rejected',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getPrivateCertificate)(certificationCourseId, {
        locale: 'fr',
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`Certificate not found for ID ${certificationCourseId}`);
    });

    it('should return a PrivateCertificate', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);

      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isCancelled: false,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'ABCDE-F',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        commentForCandidate: 'Il aime beaucoup les mangues, et ça se voit !',
      };

      const { certificationCourseId } = await _buildValidPrivateCertificate(privateCertificateData);

      // when
      const privateCertificate = await certificateRepository.getPrivateCertificate(certificationCourseId);

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
        id: certificationCourseId,
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
        };

        const { certificationCourseId, assessmentResultId } = await _buildValidPrivateCertificate(
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
          framework: null,
        });

        const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas([
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
        const privateCertificate = await certificateRepository.getPrivateCertificate(certificationCourseId, {
          locale: 'fr',
        });

        // then
        const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({
          id: `${certificationCourseId}-${assessmentResultId}`,
          competenceMarks: [competenceMarks1, competenceMarks2],
          competenceTree: domainBuilder.buildCompetenceTree({ areas: [area1] }),
        });
        const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
          id: certificationCourseId,
          resultCompetenceTree,
          ...privateCertificateData,
        });
        expect(privateCertificate).to.deepEqualInstance(expectedPrivateCertificate);
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
          isCancelled: false,
          userId,
          date: new Date('2020-01-01'),
          verificationCode: 'ABCDE-F',
          maxReachableLevelOnCertificationDate: 5,
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: 51,
          commentForCandidate: 'Il aime beaucoup les mangues, et ça se voit !',
        };

        const { certificationCourseId, assessmentResultId } = await _buildValidPrivateCertificate(
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
          framework: null,
        });

        const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas([
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
        const privateCertificate = await certificateRepository.getPrivateCertificate(certificationCourseId, {
          locale: 'en',
        });

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
        const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
          id: certificationCourseId,
          resultCompetenceTree,
          ...privateCertificateData,
        });
        expect(privateCertificate).to.deepEqualInstance(expectedPrivateCertificate);
      });
    });

    context('acquired certifiable badges', function () {
      it('should get the certified badge images when the certifications were acquired', async function () {
        // given
        const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
          name: 'Pix+ test',
          hasExternalJury: false,
        }).id;
        const complementaryCertificationWithJuryId = databaseBuilder.factory.buildComplementaryCertification({
          name: 'Pix+ test with Jury',
          hasExternalJury: true,
        }).id;

        const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(minimalLearningContent);
        mockLearningContent(learningContentObjects);

        const userId = databaseBuilder.factory.buildUser().id;
        const privateCertificateData = {
          firstName: 'Sarah Michelle',
          lastName: 'Gellar',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          isCancelled: false,
          userId,
          date: new Date('2020-01-01'),
          verificationCode: 'ABCDF-G',
          maxReachableLevelOnCertificationDate: 5,
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: null,
          commentForCandidate: null,
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

        const { certificationCourseId } = await _buildValidPrivateCertificateWithAcquiredAndNotAcquiredBadges({
          privateCertificateData,
          acquiredBadges: [
            {
              key: 'PIX_TEST_1',
              label: 'Pix+ test',
              imageUrl: 'https://images.pix.fr/badge1.svg',
              stickerUrl: 'https://images.pix.fr/skicker1.pdf',
              complementaryCertificationId,
              certificateMessage: 'message badge 1',
            },
            {
              key: 'PIX_TEST_2',
              label: 'Pix+ test',
              imageUrl: 'https://images.pix.fr/badge2.svg',
              stickerUrl: 'https://images.pix.fr/skicker2.pdf',
              complementaryCertificationId: complementaryCertificationWithJuryId,
              temporaryCertificateMessage: 'temporary message badge 2',
            },
          ],
        });

        await databaseBuilder.commit();

        // when
        const privateCertificate = await certificateRepository.getPrivateCertificate(certificationCourseId);

        // then
        const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
          id: certificationCourseId,
          ...privateCertificateData,
        });

        expect(privateCertificate).to.deepEqualInstanceOmitting(expectedPrivateCertificate, ['resultCompetenceTree']);
      });
    });
  });

  describe('#findPrivateCertificatesByUserId', function () {
    it('should return an empty list when the certificate does not exist', async function () {
      // when
      const result = await certificateRepository.findPrivateCertificatesByUserId({ userId: 123 });

      // then
      expect(result).to.deep.equal([]);
    });

    it('should return an empty list when the certificate has no assessment-result', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isCancelled: false,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        commentForCandidate: 'Il aime beaucoup les mangues, et ça se voit !',
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: privateCertificateData.isPublished,
        isCancelled: privateCertificateData.isCancelled,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      databaseBuilder.factory.buildAssessment({ certificationCourseId });
      await databaseBuilder.commit();

      // when
      const result = await certificateRepository.findPrivateCertificatesByUserId({ userId });

      // then
      expect(result).to.deep.equal([]);
    });

    it('should return the certificate when it is cancelled', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isCancelled: true,
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
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: privateCertificateData.isPublished,
        isCancelled: privateCertificateData.isCancelled,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId,
        pixScore: privateCertificateData.pixScore,
        status: 'validated',
      });

      await databaseBuilder.commit();

      // when
      const result = await certificateRepository.findPrivateCertificatesByUserId({ userId });

      // then
      expect(result).to.have.length(1);
    });

    it('should return the certificate when it is not published', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: false,
        isCancelled: false,
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
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: privateCertificateData.isPublished,
        isCancelled: privateCertificateData.isCancelled,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId,
        pixScore: privateCertificateData.pixScore,
        status: 'validated',
      });

      await databaseBuilder.commit();

      // when
      const result = await certificateRepository.findPrivateCertificatesByUserId({ userId });

      // then
      expect(result).to.have.length(1);
    });

    it('should return the certificate when it is rejected', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isCancelled: false,
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
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: privateCertificateData.isPublished,
        isCancelled: privateCertificateData.isCancelled,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;

      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId,
        pixScore: privateCertificateData.pixScore,
        status: 'rejected',
      });
      await databaseBuilder.commit();

      // when
      const result = await certificateRepository.findPrivateCertificatesByUserId({ userId });

      // then
      expect(result).to.have.length(1);
    });

    it('should return a collection of PrivateCertificate', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isCancelled: false,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'ABCDE-F',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        commentForCandidate: 'Il aime beaucoup les mangues, et ça se voit !',
      };

      const { certificationCourseId } = await _buildValidPrivateCertificate(privateCertificateData);
      // when
      const privateCertificates = await certificateRepository.findPrivateCertificatesByUserId({ userId });

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
        id: certificationCourseId,
        ...privateCertificateData,
      });
      expect(privateCertificates).to.have.length(1);
      expect(privateCertificates[0]).to.deepEqualInstance(expectedPrivateCertificate);
    });

    it('should return all the certificates of the user if he has many ordered by creation date DESC', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const { certificationCourseId } = await _buildValidPrivateCertificate({ userId, date: '2021-05-02' });
      const { certificationCourseId: certificationCourseId2 } = await _buildValidPrivateCertificate({
        userId,
        date: '2021-06-02',
      });
      const { certificationCourseId: certificationCourseId3 } = await _buildValidPrivateCertificate({
        userId,
        date: '2021-07-02',
      });
      await databaseBuilder.commit();

      // when
      const privateCertificates = await certificateRepository.findPrivateCertificatesByUserId({ userId });

      // then
      expect(privateCertificates).to.have.length(3);
      expect(privateCertificates[0].id).to.equal(certificationCourseId3);
      expect(privateCertificates[1].id).to.equal(certificationCourseId2);
      expect(privateCertificates[2].id).to.equal(certificationCourseId);
    });

    it('should build from the latest assessment result if validated', async function () {
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
      };

      const { certificationCourseId } = await _buildValidPrivateCertificateWithSeveralResults(privateCertificateData);

      // when
      const privateCertificates = await certificateRepository.findPrivateCertificatesByUserId({ userId });

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
        id: certificationCourseId,
        ...privateCertificateData,
      });
      expect(privateCertificates[0]).to.deepEqualInstance(expectedPrivateCertificate);
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
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
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
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId,
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

  return { certificationCourseId, assessmentResultId };
}

async function _buildValidPrivateCertificateWithAcquiredAndNotAcquiredBadges({
  privateCertificateData,
  acquiredBadges,
}) {
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  const sessionId = databaseBuilder.factory.buildSession({
    publishedAt: privateCertificateData.deliveredAt,
    certificationCenter: privateCertificateData.certificationCenter,
    certificationCenterId,
  }).id;
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    firstName: privateCertificateData.firstName,
    lastName: privateCertificateData.lastName,
    birthdate: privateCertificateData.birthdate,
    birthplace: privateCertificateData.birthplace,
    isPublished: privateCertificateData.isPublished,
    isCancelled: privateCertificateData.isCancelled,
    createdAt: privateCertificateData.date,
    verificationCode: privateCertificateData.verificationCode,
    maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
    sessionId,
    userId: privateCertificateData.userId,
  }).id;
  databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId,
    pixScore: privateCertificateData.pixScore,
    status: 'validated',
    commentForCandidate: privateCertificateData.commentForCandidate,
    createdAt: new Date('2021-01-01'),
  });

  acquiredBadges?.forEach(
    ({
      key,
      imageUrl,
      complementaryCertificationId,
      label,
      certificateMessage,
      temporaryCertificateMessage,
      stickerUrl,
    }) => {
      const badgeId = databaseBuilder.factory.buildBadge({ key }).id;
      const acquiredComplementaryBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
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
        complementaryCertificationBadgeId: acquiredComplementaryBadgeId,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId,
        partnerKey: key,
        acquired: true,
      });
    }
  );
  await databaseBuilder.commit();
  return { certificationCourseId };
}

async function _buildValidPrivateCertificateWithSeveralResults(privateCertificateData) {
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  const sessionId = databaseBuilder.factory.buildSession({
    publishedAt: privateCertificateData.deliveredAt,
    certificationCenter: privateCertificateData.certificationCenter,
    certificationCenterId,
  }).id;
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
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
  const { id: lastAssessmentResultId } = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId,
    pixScore: privateCertificateData.pixScore,
    status: 'validated',
    commentForCandidate: privateCertificateData.commentForCandidate,
    createdAt: new Date('2021-03-01'),
  });

  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId: lastAssessmentResultId,
  });

  await databaseBuilder.commit();

  return { certificationCourseId };
}
