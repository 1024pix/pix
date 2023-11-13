import {
  expect,
  databaseBuilder,
  domainBuilder,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../../test-helper.js';
import * as certificationRepository from '../../../../../../src/certification/course/infrastructure/repositories/certificate-repository.js';
import { status } from '../../../../../../lib/domain/models/AssessmentResult.js';

describe('Integration | Infrastructure | Repository | Certification', function () {
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

  describe('#findByDivisionForScoIsManagingStudentsOrganization', function () {
    it('should return an empty array when there are no certification attestations for given organization', async function () {
      // given
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      databaseBuilder.factory.buildOrganization({ id: 456, type: 'SCO', isManagingStudents: true });
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
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildValidCertificationAttestation(certificationAttestationData);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 456,
        division: '3emeB',
      });
      await databaseBuilder.commit();

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
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SUP', isManagingStudents: false });
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
      _buildSession({
        userId: 456,
        sessionId: 789,
        publishedAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
      });
      _buildValidCertificationAttestation(certificationAttestationData);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 123,
        division: '3emeB',
      });
      await databaseBuilder.commit();

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
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
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
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildValidCertificationAttestation(certificationAttestationData);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 123,
        division: '5emeG',
      });
      await databaseBuilder.commit();

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
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
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
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildRejected(certificationAttestationData);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 123,
        division: '3emeB',
      });
      await databaseBuilder.commit();

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
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
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
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildCancelled(certificationAttestationData);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 123,
        division: '3emeB',
      });
      await databaseBuilder.commit();

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
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
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
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildValidCertificationAttestation(certificationAttestationData);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 123,
        division: '3emeB',
      });
      await databaseBuilder.commit();

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
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
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
      _buildSession({
        userId: certificationAttestationDataA.userId,
        sessionId: certificationAttestationDataA.sessionId,
        publishedAt: certificationAttestationDataA.deliveredAt,
        certificationCenter: certificationAttestationDataA.certificationCenter,
      });
      _buildSession({
        userId: certificationAttestationDataC.userId,
        sessionId: certificationAttestationDataC.sessionId,
        publishedAt: certificationAttestationDataC.deliveredAt,
        certificationCenter: certificationAttestationDataC.certificationCenter,
      });
      _buildSession({
        userId: certificationAttestationDataB.userId,
        sessionId: certificationAttestationDataB.sessionId,
        publishedAt: certificationAttestationDataB.deliveredAt,
        certificationCenter: certificationAttestationDataB.certificationCenter,
      });
      _buildValidCertificationAttestation(certificationAttestationDataA);
      _buildValidCertificationAttestation(certificationAttestationDataB);
      _buildValidCertificationAttestation(certificationAttestationDataC);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataA,
        organizationId: 123,
        division: '3emeB',
      });
      _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataB,
        organizationId: 123,
        division: '3emeB',
      });
      _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataC,
        organizationId: 123,
        division: '3emeB',
      });
      await databaseBuilder.commit();

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
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
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
      _buildSession({
        userId: certificationAttestationDataA.userId,
        sessionId: certificationAttestationDataA.sessionId,
        publishedAt: certificationAttestationDataA.deliveredAt,
        certificationCenter: certificationAttestationDataA.certificationCenter,
      });
      _buildSession({
        userId: certificationAttestationDataC.userId,
        sessionId: certificationAttestationDataC.sessionId,
        publishedAt: certificationAttestationDataC.deliveredAt,
        certificationCenter: certificationAttestationDataC.certificationCenter,
      });
      _buildSession({
        userId: certificationAttestationDataB.userId,
        sessionId: certificationAttestationDataB.sessionId,
        publishedAt: certificationAttestationDataB.deliveredAt,
        certificationCenter: certificationAttestationDataB.certificationCenter,
      });
      _buildValidCertificationAttestation(certificationAttestationDataA);
      _buildValidCertificationAttestation(certificationAttestationDataB);
      _buildValidCertificationAttestation(certificationAttestationDataC);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataA,
        organizationId: 123,
        division: '3emeB',
      });
      _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataB,
        organizationId: 123,
        division: '3emeB',
      });
      _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataC,
        organizationId: 123,
        division: '3emeB',
        isDisabled: true,
      });
      await databaseBuilder.commit();

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

    describe('when the last certification is rejected', function () {
      it('should take into account the latest valid certification', async function () {
        // given
        const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
        mockLearningContent(learningContentObjects);
        databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
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
        databaseBuilder.factory.buildUser({ id: 456 });
        databaseBuilder.factory.buildOrganizationLearner({
          id: 55,
          organizationId: 123,
          userId: 456,
          division: '3emeB',
        }).id;
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        databaseBuilder.factory.buildSession({
          id: 789,
          publishedAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          certificationCenterId,
        });

        _buildCertificationAttestationWithSeveralResults(certificationAttestationData, status.VALIDATED);
        _linkCertificationAttestationToOrganization({
          certificationAttestationData,
          organizationLearnerId: 55,
        });

        const certificationAttestationDataRejected = {
          ...certificationAttestationData,
          id: 124,
          date: new Date('2020-01-03'),
          sessionId: 790,
          verificationCode: 'P-SOM3COD3',
        };
        databaseBuilder.factory.buildSession({
          id: 790,
          publishedAt: new Date('2021-05-07'),
          certificationCenter: 'Centre des poules bien dodues',
          certificationCenterId,
        });
        _buildCertificationAttestationWithSeveralResults(certificationAttestationDataRejected, status.REJECTED);
        databaseBuilder.factory.buildCertificationCandidate({
          userId: 456,
          sessionId: certificationAttestationDataRejected.sessionId,
          organizationLearnerId: 55,
        });

        await databaseBuilder.commit();

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
    });

    it('should take into account the latest certification of an organization learner', async function () {
      // given
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: 123,
        division: '3emeb',
      }).id;
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
      _buildSession({
        userId: certificationAttestationDataOldest.userId,
        sessionId: certificationAttestationDataOldest.sessionId,
        publishedAt: certificationAttestationDataOldest.deliveredAt,
        certificationCenter: certificationAttestationDataOldest.certificationCenter,
      });
      _buildSession({
        userId: certificationAttestationDataNewest.userId,
        sessionId: certificationAttestationDataNewest.sessionId,
        publishedAt: certificationAttestationDataNewest.deliveredAt,
        certificationCenter: certificationAttestationDataNewest.certificationCenter,
      });
      _buildValidCertificationAttestation(certificationAttestationDataOldest);
      _buildValidCertificationAttestation(certificationAttestationDataNewest);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataOldest,
        organizationId: 123,
        organizationLearnerId,
      });
      _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataNewest,
        organizationId: 123,
        organizationLearnerId,
      });
      await databaseBuilder.commit();

      // when
      const certificationAttestations =
        await certificationRepository.findByDivisionForScoIsManagingStudentsOrganization({
          organizationId: 123,
          division: '3emeB',
        });

      // then
      const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation(
        certificationAttestationDataNewest,
      );
      expect(certificationAttestations).to.have.length(1);
      expect(certificationAttestations[0]).to.deepEqualInstanceOmitting(expectedCertificationAttestation, [
        'resultCompetenceTree',
      ]);
    });
  });
});

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

function _linkCertificationAttestationToOrganization({
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
}
