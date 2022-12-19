const {
  expect,
  databaseBuilder,
  domainBuilder,
  catchErr,
  learningContentBuilder,
  mockLearningContent,
} = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certificate-repository');

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
      await _buildIncomplete(certificationAttestationData);

      // when
      const error = await catchErr(certificationRepository.getCertificationAttestation)(
        certificationAttestationData.id
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
      await _buildCancelled(certificationAttestationData);

      // when
      const error = await catchErr(certificationRepository.getCertificationAttestation)(
        certificationAttestationData.id
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
      await _buildValidCertificationAttestation(certificationAttestationData);

      // when
      const error = await catchErr(certificationRepository.getCertificationAttestation)(
        certificationAttestationData.id
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
      await _buildRejected(certificationAttestationData);
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificationRepository.getCertificationAttestation)(
        certificationAttestationData.id
      );

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should return a CertificationAttestation', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(minimalLearningContent);
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
      await _buildValidCertificationAttestation(certificationAttestationData);

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

      const assessmentResultId = await _buildValidCertificationAttestation(certificationAttestationData, false);

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

      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas([
        { ...area1, titleFr: area1.title },
      ]);
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
      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(minimalLearningContent);
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
      await _buildValidCertificationAttestationWithSeveralResults(certificationAttestationData);
      await databaseBuilder.commit();

      // when
      const certificationAttestation = await certificationRepository.getCertificationAttestation(
        certificationAttestationData.id
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
        const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(minimalLearningContent);
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
        await _buildValidCertificationAttestation(certificationAttestationData);
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

  describe('#findByDivisionForScoIsManagingStudentsOrganization', function () {
    it('should return an empty array when there are no certification attestations for given organization', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      databaseBuilder.factory.buildOrganization({ id: 456, type: 'SCO', isManagingStudents: true });
      await databaseBuilder.commit();
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildValidCertificationAttestation(certificationAttestationData);
      await _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 456,
        division: '3emeB',
      });

      // when
      const certificationAttestations =
        await certificationRepository.findByDivisionForScoIsManagingStudentsOrganization({
          organizationId: 123,
          division: '3emeB',
        });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should return an empty array when the organization is not SCO IS MANAGING STUDENTS', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SUP', isManagingStudents: false });
      await databaseBuilder.commit();
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildValidCertificationAttestation(certificationAttestationData);
      await _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 123,
        division: '3emeB',
      });

      // when
      const certificationAttestations =
        await certificationRepository.findByDivisionForScoIsManagingStudentsOrganization({
          organizationId: 123,
          division: '3emeB',
        });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should return an empty array when the certification does not belong to an organization learner in the right division', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      await databaseBuilder.commit();
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildValidCertificationAttestation(certificationAttestationData);
      await _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 123,
        division: '5emeG',
      });

      // when
      const certificationAttestations =
        await certificationRepository.findByDivisionForScoIsManagingStudentsOrganization({
          organizationId: 123,
          division: '3emeB',
        });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should not return certifications that have no validated assessment-result', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      await databaseBuilder.commit();
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildRejected(certificationAttestationData);
      await _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 123,
        division: '3emeB',
      });

      // when
      const certificationAttestations =
        await certificationRepository.findByDivisionForScoIsManagingStudentsOrganization({
          organizationId: 123,
          division: '3emeB',
        });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should not return cancelled certifications', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      await databaseBuilder.commit();
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildCancelled(certificationAttestationData);
      await _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 123,
        division: '3emeB',
      });

      // when
      const certificationAttestations =
        await certificationRepository.findByDivisionForScoIsManagingStudentsOrganization({
          organizationId: 123,
          division: '3emeB',
        });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should not return non published certifications', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      await databaseBuilder.commit();
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildValidCertificationAttestation(certificationAttestationData);
      await _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 123,
        division: '3emeB',
      });

      // when
      const certificationAttestations =
        await certificationRepository.findByDivisionForScoIsManagingStudentsOrganization({
          organizationId: 123,
          division: '3emeB',
        });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should return an array of certification attestations ordered by last name, first name', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      await databaseBuilder.commit();
      const certificationAttestationDataA = {
        id: 456,
        firstName: 'James',
        lastName: 'Marsters',
        birthdate: '1962-08-20',
        birthplace: 'Trouville',
        isPublished: true,
        userId: 111,
        date: new Date('2020-05-01'),
        verificationCode: 'P-SOMEOTHERCODE',
        maxReachableLevelOnCertificationDate: 6,
        deliveredAt: new Date('2021-07-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 23,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 777,
      };
      const certificationAttestationDataB = {
        id: 123,
        firstName: 'Laura',
        lastName: 'Gellar',
        birthdate: '1990-01-04',
        birthplace: 'Torreilles',
        isPublished: true,
        userId: 333,
        date: new Date('2019-01-01'),
        verificationCode: 'P-YETANOTHERCODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2020-05-05'),
        certificationCenter: 'Centre Catalan',
        pixScore: 150,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 999,
      };
      const certificationAttestationDataC = {
        id: 789,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 222,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 888,
      };
      await _buildValidCertificationAttestation(certificationAttestationDataA);
      await _buildValidCertificationAttestation(certificationAttestationDataB);
      await _buildValidCertificationAttestation(certificationAttestationDataC);
      await _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataA,
        organizationId: 123,
        division: '3emeB',
      });
      await _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataB,
        organizationId: 123,
        division: '3emeB',
      });
      await _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataC,
        organizationId: 123,
        division: '3emeB',
      });

      // when
      const certificationAttestations =
        await certificationRepository.findByDivisionForScoIsManagingStudentsOrganization({
          organizationId: 123,
          division: '3emeB',
        });

      // then
      const expectedCertificationAttestationA =
        domainBuilder.buildCertificationAttestation(certificationAttestationDataA);
      const expectedCertificationAttestationB =
        domainBuilder.buildCertificationAttestation(certificationAttestationDataB);
      const expectedCertificationAttestationC =
        domainBuilder.buildCertificationAttestation(certificationAttestationDataC);
      expect(certificationAttestations).to.have.length(3);

      expect(certificationAttestations[0]).deepEqualInstanceOmitting(expectedCertificationAttestationB, [
        'resultCompetenceTree',
      ]);
      expect(certificationAttestations[1]).deepEqualInstanceOmitting(expectedCertificationAttestationC, [
        'resultCompetenceTree',
      ]);
      expect(certificationAttestations[2]).deepEqualInstanceOmitting(expectedCertificationAttestationA, [
        'resultCompetenceTree',
      ]);
    });

    it('should ignore disabled shooling-registrations', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      await databaseBuilder.commit();
      const certificationAttestationDataA = {
        id: 456,
        firstName: 'James',
        lastName: 'Marsters',
        birthdate: '1962-08-20',
        birthplace: 'Trouville',
        isPublished: true,
        userId: 111,
        date: new Date('2020-05-01'),
        verificationCode: 'P-SOMEOTHERCODE',
        maxReachableLevelOnCertificationDate: 6,
        deliveredAt: new Date('2021-07-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 23,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 777,
      };
      const certificationAttestationDataB = {
        id: 123,
        firstName: 'Laura',
        lastName: 'Gellar',
        birthdate: '1990-01-04',
        birthplace: 'Torreilles',
        isPublished: true,
        userId: 333,
        date: new Date('2019-01-01'),
        verificationCode: 'P-YETANOTHERCODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2020-05-05'),
        certificationCenter: 'Centre Catalan',
        pixScore: 150,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 999,
      };
      const certificationAttestationDataC = {
        id: 789,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 222,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 888,
      };
      await _buildValidCertificationAttestation(certificationAttestationDataA);
      await _buildValidCertificationAttestation(certificationAttestationDataB);
      await _buildValidCertificationAttestation(certificationAttestationDataC);
      await _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataA,
        organizationId: 123,
        division: '3emeB',
      });
      await _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataB,
        organizationId: 123,
        division: '3emeB',
      });
      await _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataC,
        organizationId: 123,
        division: '3emeB',
        isDisabled: true,
      });

      // when
      const certificationAttestations =
        await certificationRepository.findByDivisionForScoIsManagingStudentsOrganization({
          organizationId: 123,
          division: '3emeB',
        });

      // then
      const expectedCertificationAttestationA =
        domainBuilder.buildCertificationAttestation(certificationAttestationDataA);
      const expectedCertificationAttestationB =
        domainBuilder.buildCertificationAttestation(certificationAttestationDataB);

      expect(certificationAttestations).to.have.length(2);
      expect(certificationAttestations[0]).to.deepEqualInstanceOmitting(expectedCertificationAttestationB, [
        'resultCompetenceTree',
      ]);

      expect(certificationAttestations[1]).to.deepEqualInstanceOmitting(expectedCertificationAttestationA, [
        'resultCompetenceTree',
      ]);
    });

    it('should take into account the latest validated assessment result of the certification', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      await databaseBuilder.commit();
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      await _buildValidCertificationAttestationWithSeveralResults(certificationAttestationData);
      await _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 123,
        division: '3emeB',
      });

      // when
      const certificationAttestations =
        await certificationRepository.findByDivisionForScoIsManagingStudentsOrganization({
          organizationId: 123,
          division: '3emeB',
        });

      // then
      const expectedCertificationAttestation =
        domainBuilder.buildCertificationAttestation(certificationAttestationData);
      expect(certificationAttestations).to.have.length(1);
      expect(certificationAttestations[0]).to.deepEqualInstanceOmitting(expectedCertificationAttestation, [
        'resultCompetenceTree',
      ]);
    });

    it('should take into account the latest certification of an organization learner', async function () {
      // given
      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: 123,
        division: '3emeb',
      }).id;
      await databaseBuilder.commit();
      const certificationAttestationDataOldest = {
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
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      const certificationAttestationDataNewest = {
        id: 456,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 789,
        date: new Date('2021-01-01'),
        verificationCode: 'P-SOMEOTHERCODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien maigrelettes',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 999,
      };
      await _buildValidCertificationAttestation(certificationAttestationDataOldest);
      await _buildValidCertificationAttestation(certificationAttestationDataNewest);
      await _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataOldest,
        organizationId: 123,
        organizationLearnerId,
      });
      await _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataNewest,
        organizationId: 123,
        organizationLearnerId,
      });

      // when
      const certificationAttestations =
        await certificationRepository.findByDivisionForScoIsManagingStudentsOrganization({
          organizationId: 123,
          division: '3emeB',
        });

      // then
      const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation(
        certificationAttestationDataNewest
      );
      expect(certificationAttestations).to.have.length(1);
      expect(certificationAttestations[0]).to.deepEqualInstanceOmitting(expectedCertificationAttestation, [
        'resultCompetenceTree',
      ]);
    });
  });
});

async function _buildIncomplete(certificationAttestationData) {
  databaseBuilder.factory.buildUser({ id: certificationAttestationData.userId });
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  databaseBuilder.factory.buildSession({
    id: certificationAttestationData.sessionId,
    publishedAt: certificationAttestationData.deliveredAt,
    certificationCenter: certificationAttestationData.certificationCenter,
    certificationCenterId,
  });
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
  await databaseBuilder.commit();
}

async function _buildRejected(certificationAttestationData) {
  databaseBuilder.factory.buildUser({ id: certificationAttestationData.userId });
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  databaseBuilder.factory.buildSession({
    id: certificationAttestationData.sessionId,
    publishedAt: certificationAttestationData.deliveredAt,
    certificationCenter: certificationAttestationData.certificationCenter,
    certificationCenterId,
  });
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
  const assessmentId = databaseBuilder.factory.buildAssessment({
    certificationCourseId: certificationAttestationData.id,
  }).id;
  databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: certificationAttestationData.pixScore,
    status: 'rejected',
  });
  await databaseBuilder.commit();
}

async function _buildCancelled(certificationAttestationData) {
  databaseBuilder.factory.buildUser({ id: certificationAttestationData.userId });
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  databaseBuilder.factory.buildSession({
    id: certificationAttestationData.sessionId,
    publishedAt: certificationAttestationData.deliveredAt,
    certificationCenter: certificationAttestationData.certificationCenter,
    certificationCenterId,
  });
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
  const assessmentId = databaseBuilder.factory.buildAssessment({
    certificationCourseId: certificationAttestationData.id,
  }).id;
  databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: certificationAttestationData.pixScore,
    status: 'validated',
  });
  await databaseBuilder.commit();
}

async function _buildValidCertificationAttestation(certificationAttestationData, buildCompetenceMark = true) {
  databaseBuilder.factory.buildUser({ id: certificationAttestationData.userId });
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  databaseBuilder.factory.buildSession({
    id: certificationAttestationData.sessionId,
    publishedAt: certificationAttestationData.deliveredAt,
    certificationCenter: certificationAttestationData.certificationCenter,
    certificationCenterId,
  });
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
  const assessmentId = databaseBuilder.factory.buildAssessment({
    certificationCourseId: certificationAttestationData.id,
  }).id;
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: certificationAttestationData.pixScore,
    status: 'validated',
    createdAt: new Date('2020-01-02'),
  }).id;

  if (buildCompetenceMark) {
    databaseBuilder.factory.buildCompetenceMark({
      assessmentResultId,
    });
  }

  await databaseBuilder.commit();

  return assessmentResultId;
}

async function _buildValidCertificationAttestationWithSeveralResults(certificationAttestationData) {
  databaseBuilder.factory.buildUser({ id: certificationAttestationData.userId });
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  databaseBuilder.factory.buildSession({
    id: certificationAttestationData.sessionId,
    publishedAt: certificationAttestationData.deliveredAt,
    certificationCenter: certificationAttestationData.certificationCenter,
    certificationCenterId,
  });
  const mostRecentSessionId = databaseBuilder.factory.buildSession({
    publishedAt: certificationAttestationData.deliveredAt,
    certificationCenter: certificationAttestationData.certificationCenter,
    certificationCenterId,
  }).id;
  const mostRecentCertificationCourseId = databaseBuilder.factory.buildCertificationCourse({
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
  databaseBuilder.factory.buildCertificationCourse({ sessionId: mostRecentSessionId });
  const assessmentId = databaseBuilder.factory.buildAssessment({
    certificationCourseId: certificationAttestationData.id,
  }).id;
  const assessmentResultId1 = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: certificationAttestationData.pixScore,
    status: 'validated',
    createdAt: new Date('2019-01-01'),
  }).id;
  const assessmentResultId2 = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: certificationAttestationData.pixScore,
    status: 'validated',
    createdAt: new Date('2019-01-02'),
  }).id;
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId: assessmentResultId1,
  });
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId: assessmentResultId2,
  });

  const mostRecentAssessmentId = databaseBuilder.factory.buildAssessment({
    certificationCourseId: mostRecentCertificationCourseId,
  }).id;
  const mostRecentAssessmentResultId1 = databaseBuilder.factory.buildAssessmentResult({
    assessmentId: mostRecentAssessmentId,
    pixScore: certificationAttestationData.pixScore,
    status: 'validated',
    createdAt: new Date('2020-01-02'),
  }).id;
  const mostRecentAssessmentResultId2 = databaseBuilder.factory.buildAssessmentResult({
    assessmentId: mostRecentAssessmentId,
    pixScore: certificationAttestationData.pixScore + 20,
    status: 'validated',
    createdAt: new Date('2020-01-01'),
  }).id;
  const mostRecentAssessmentResultId3 = databaseBuilder.factory.buildAssessmentResult({
    assessmentId: mostRecentAssessmentId,
    pixScore: 0,
    status: 'rejected',
    createdAt: new Date('2020-01-03'),
  }).id;
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId: mostRecentAssessmentResultId1,
  });
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId: mostRecentAssessmentResultId2,
  });
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId: mostRecentAssessmentResultId3,
  });

  await databaseBuilder.commit();
}

async function _linkCertificationAttestationToOrganization({
  certificationAttestationData,
  organizationId,
  division,
  organizationLearnerId = null,
  isDisabled = false,
}) {
  const srId =
    organizationLearnerId ||
    databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
      userId: certificationAttestationData.userId,
      division,
      isDisabled,
    }).id;
  databaseBuilder.factory.buildCertificationCandidate({
    userId: certificationAttestationData.userId,
    sessionId: certificationAttestationData.sessionId,
    organizationLearnerId: srId,
  });
  await databaseBuilder.commit();
}
