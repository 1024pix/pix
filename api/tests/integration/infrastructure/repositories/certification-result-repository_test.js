const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const certificationResultRepository = require('../../../../lib/infrastructure/repositories/certification-result-repository');
const CertificationResult = require('../../../../lib/domain/models/CertificationResult');
const ComplementaryCertificationCourseResult = require('../../../../lib/domain/models/ComplementaryCertificationCourseResult');
const {
  PIX_EMPLOI_CLEA_V1,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
} = require('../../../../lib/domain/models/Badge').keys;

describe('Integration | Infrastructure | Repository | Certification Result', function () {
  describe('#findBySessionId', function () {
    it('should return all certification results in a session ordered by lastName, firstName', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const certificationCourseId1 = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        isPublished: true,
        isCancelled: false,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        sessionId,
      }).id;
      const certificationCourseId2 = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Rupert',
        lastName: 'Giles',
        birthdate: '1964-03-15',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isCancelled: false,
        externalId: 'RIPPER',
        createdAt: new Date('2021-06-06'),
        sessionId,
      }).id;
      const certificationCourseId3 = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Auffy',
        lastName: 'Summers',
        birthdate: '1981-01-01',
        birthplace: 'Salem',
        isPublished: true,
        isCancelled: true,
        externalId: 'WITCH',
        createdAt: new Date('2020-10-10'),
        sessionId,
      }).id;
      const certificationCourseIdNotInSession = databaseBuilder.factory.buildCertificationCourse().id;
      const assessmentId1 = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId1,
      }).id;
      const assessmentId2 = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId2,
      }).id;
      databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId3,
      });
      databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseIdNotInSession,
      });
      const assessmentResultId1 = databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentId1,
        pixScore: 123,
        status: CertificationResult.status.VALIDATED,
        commentForOrganization: 'Un commentaire orga 1',
      }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentId2,
        pixScore: 0,
        status: CertificationResult.status.REJECTED,
        commentForOrganization: 'Un commentaire orga 2',
      });
      databaseBuilder.factory.buildCompetenceMark({
        id: 123,
        score: 10,
        level: 4,
        competence_code: '2.3',
        area_code: '2',
        competenceId: 'recComp23',
        assessmentResultId: assessmentResultId1,
      });
      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

      // then
      const expectedFirstCertificationResult = domainBuilder.buildCertificationResult({
        id: certificationCourseId2,
        firstName: 'Rupert',
        lastName: 'Giles',
        birthdate: '1964-03-15',
        birthplace: 'Saint-Ouen',
        externalId: 'RIPPER',
        createdAt: new Date('2021-06-06'),
        sessionId,
        status: CertificationResult.status.REJECTED,
        pixScore: 0,
        commentForOrganization: 'Un commentaire orga 2',
        competencesWithMark: [],
        complementaryCertificationCourseResults: [],
      });
      const expectedSecondCertificationResult = domainBuilder.buildCertificationResult({
        id: certificationCourseId3,
        firstName: 'Auffy',
        lastName: 'Summers',
        birthdate: '1981-01-01',
        birthplace: 'Salem',
        externalId: 'WITCH',
        createdAt: new Date('2020-10-10'),
        sessionId,
        status: CertificationResult.status.CANCELLED,
        pixScore: null,
        commentForOrganization: null,
        competencesWithMark: [],
        complementaryCertificationCourseResults: [],
        emitter: null,
      });
      const expectedThirdCertificationResult = domainBuilder.buildCertificationResult({
        id: certificationCourseId1,
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        sessionId,
        status: CertificationResult.status.VALIDATED,
        pixScore: 123,
        commentForOrganization: 'Un commentaire orga 1',
        competencesWithMark: [
          domainBuilder.buildCompetenceMark({
            id: 123,
            score: 10,
            level: 4,
            competence_code: '2.3',
            area_code: '2',
            competenceId: 'recComp23',
            assessmentResultId: assessmentResultId1,
          }),
        ],
        complementaryCertificationCourseResults: [],
      });
      expect(certificationResults).to.deepEqualArray([
        expectedFirstCertificationResult,
        expectedSecondCertificationResult,
        expectedThirdCertificationResult,
      ]);
    });

    it('should ignore non published certifications', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        isPublished: false,
        isCancelled: false,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        sessionId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({
        certificationCourseId,
      }).id;
      const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: 123,
        status: CertificationResult.status.VALIDATED,
        commentForOrganization: 'Un commentaire orga 1',
      }).id;
      databaseBuilder.factory.buildCompetenceMark({
        id: 123,
        score: 10,
        level: 4,
        competence_code: '2.3',
        area_code: '2',
        competenceId: 'recComp23',
        assessmentResultId,
      });
      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

      // then
      expect(certificationResults).to.be.empty;
    });

    it(`should return complementary certifications linked to the certifications`, async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const {
        certificationCourseId: cleaCertificationCourseId,
        assessmentResultId: cleaAssessmentResultId,
        competenceMarkId: cleaCompetenceMarkId,
      } = await _buildCertificationResultInSession(sessionId);
      const cleaBadgeId = databaseBuilder.factory.buildBadge({ key: PIX_EMPLOI_CLEA_V1 }).id;
      const cleaComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
        key: PIX_EMPLOI_CLEA_V1,
      }).id;
      const cleaComplementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: cleaBadgeId,
        complementaryCertificationId: cleaComplementaryCertificationId,
        label: 'CléA Numérique',
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 998,
        certificationCourseId: cleaCertificationCourseId,
        complementaryCertificationId: cleaComplementaryCertificationId,
        complementaryCertificationBadgeId: cleaComplementaryCertificationBadgeId,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 998,
        partnerKey: PIX_EMPLOI_CLEA_V1,
        acquired: true,
        source: 'PIX',
      });

      const {
        certificationCourseId: pixEdu1erDegreCertificationCourseId,
        assessmentResultId: pixEdu1erDegreAssessmentResultId,
        competenceMarkId: pixEdu1erDegreCompetenceMarkId,
      } = await _buildCertificationResultInSession(sessionId);
      const edu1erDegreComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
        name: 'Pix+ Edu 1er degre',
      }).id;
      databaseBuilder.factory.buildBadge({ id: 12345, key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT });
      const pixEduComplementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: '12345',
        complementaryCertificationId: edu1erDegreComplementaryCertificationId,
        label: 'Pix+ Édu 1er degré Expert',
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 997,
        certificationCourseId: pixEdu1erDegreCertificationCourseId,
        complementaryCertificationBadgeId: pixEduComplementaryCertificationBadgeId,
        complementaryCertificationId: edu1erDegreComplementaryCertificationId,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 997,
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
        acquired: false,
        source: 'PIX',
      });

      const {
        certificationCourseId: pixEdu2ndDegreCertificationCourseId,
        assessmentResultId: pixEdu2ndDegreAssessmentResultId,
        competenceMarkId: pixEdu2ndDegreCompetenceMarkId,
      } = await _buildCertificationResultInSession(sessionId);
      const edu2ndDegreComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
        name: 'Pix+ Édu 2nd degré',
      }).id;
      databaseBuilder.factory.buildBadge({ id: 6434, key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME });
      const pixEdu2ndComplementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: 6434,
        complementaryCertificationId: edu2ndDegreComplementaryCertificationId,
        label: 'Pix+ Édu 2nd degré Confirmé',
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 996,
        certificationCourseId: pixEdu2ndDegreCertificationCourseId,
        complementaryCertificationBadgeId: pixEdu2ndComplementaryCertificationBadgeId,
        complementaryCertificationId: edu2ndDegreComplementaryCertificationId,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 996,
        partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
        acquired: true,
        source: 'PIX',
      });

      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

      // then
      const expectedResult = [
        domainBuilder.buildCertificationResult({
          id: cleaCertificationCourseId,
          firstName: 'first-name',
          lastName: 'last-name',
          externalId: 'externalId',
          pixScore: 456,
          sessionId,
          status: 'validated',
          birthdate: '2001-05-21',
          birthplace: 'Paris',
          createdAt: new Date('2020-01-01T00:00:00Z'),
          commentForOrganization: 'Some comment for organization',
          competencesWithMark: [
            domainBuilder.buildCompetenceMark({
              id: cleaCompetenceMarkId,
              score: 42,
              level: 5,
              competence_code: '1.1',
              area_code: '1',
              competenceId: 'recABC123',
              assessmentResultId: cleaAssessmentResultId,
            }),
          ],
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: true,
              complementaryCertificationCourseId: 998,
              partnerKey: PIX_EMPLOI_CLEA_V1,
              source: 'PIX',
              label: 'CléA Numérique',
            }),
          ],
        }),
        domainBuilder.buildCertificationResult({
          id: pixEdu1erDegreCertificationCourseId,
          firstName: 'first-name',
          lastName: 'last-name',
          externalId: 'externalId',
          pixScore: 456,
          sessionId,
          status: 'validated',
          birthdate: '2001-05-21',
          birthplace: 'Paris',
          createdAt: new Date('2020-01-01T00:00:00Z'),
          commentForOrganization: 'Some comment for organization',
          competencesWithMark: [
            domainBuilder.buildCompetenceMark({
              id: pixEdu1erDegreCompetenceMarkId,
              score: 42,
              level: 5,
              competence_code: '1.1',
              area_code: '1',
              competenceId: 'recABC123',
              assessmentResultId: pixEdu1erDegreAssessmentResultId,
            }),
          ],
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: false,
              complementaryCertificationCourseId: 997,
              partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
              source: 'PIX',
              label: 'Pix+ Édu 1er degré Expert',
            }),
          ],
        }),
        domainBuilder.buildCertificationResult({
          id: pixEdu2ndDegreCertificationCourseId,
          firstName: 'first-name',
          lastName: 'last-name',
          externalId: 'externalId',
          pixScore: 456,
          sessionId,
          status: 'validated',
          birthdate: '2001-05-21',
          birthplace: 'Paris',
          createdAt: new Date('2020-01-01T00:00:00Z'),
          commentForOrganization: 'Some comment for organization',
          competencesWithMark: [
            domainBuilder.buildCompetenceMark({
              id: pixEdu2ndDegreCompetenceMarkId,
              score: 42,
              level: 5,
              competence_code: '1.1',
              area_code: '1',
              competenceId: 'recABC123',
              assessmentResultId: pixEdu2ndDegreAssessmentResultId,
            }),
          ],
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: true,
              complementaryCertificationCourseId: 996,
              partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
              source: 'PIX',
              label: 'Pix+ Édu 2nd degré Confirmé',
            }),
          ],
        }),
      ];
      expect(certificationResults).to.deepEqualArray(expectedResult);
    });

    it(`should return only complementary certifications of Pix source`, async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const {
        certificationCourseId: pixEdu1erDegreCertificationCourseId,
        assessmentResultId: pixEdu1erDegreAssessmentResultId,
        competenceMarkId: pixEdu1erDegreCompetenceMarkId,
      } = await _buildCertificationResultInSession(sessionId);
      const edu1erDegreComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
        name: 'Pix+ Edu 1er degre',
      }).id;
      databaseBuilder.factory.buildBadge({ id: 12345, key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 997,
        certificationCourseId: pixEdu1erDegreCertificationCourseId,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 997,
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
        acquired: true,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 997,
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
        acquired: true,
        source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: 12345,
        complementaryCertificationId: edu1erDegreComplementaryCertificationId,
        label: 'Pix+ Édu 1er degré Expert',
      });

      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

      // then
      const expectedResult = [
        domainBuilder.buildCertificationResult({
          id: pixEdu1erDegreCertificationCourseId,
          firstName: 'first-name',
          lastName: 'last-name',
          externalId: 'externalId',
          pixScore: 456,
          sessionId,
          status: 'validated',
          birthdate: '2001-05-21',
          birthplace: 'Paris',
          createdAt: new Date('2020-01-01T00:00:00Z'),
          commentForOrganization: 'Some comment for organization',
          competencesWithMark: [
            domainBuilder.buildCompetenceMark({
              id: pixEdu1erDegreCompetenceMarkId,
              score: 42,
              level: 5,
              competence_code: '1.1',
              area_code: '1',
              competenceId: 'recABC123',
              assessmentResultId: pixEdu1erDegreAssessmentResultId,
            }),
          ],
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: true,
              complementaryCertificationCourseId: 997,
              partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
              source: 'PIX',
              label: 'Pix+ Édu 1er degré Expert',
            }),
          ],
        }),
      ];
      expect(certificationResults).to.deepEqualArray(expectedResult);
    });

    it(`should return complementary certification results ordered by complementaryCertificationId and level`, async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const { certificationCourseId } = await _buildCertificationResultInSession(sessionId);
      databaseBuilder.factory.buildBadge({ key: 'First badge expert', id: 123 });
      databaseBuilder.factory.buildBadge({ key: 'First badge maître', id: 456 });
      databaseBuilder.factory.buildBadge({ key: 'Second badge expert', id: 789 });
      databaseBuilder.factory.buildBadge({ key: 'Second badge maître', id: 101112 });
      databaseBuilder.factory.buildComplementaryCertification({
        id: 123,
      });
      databaseBuilder.factory.buildComplementaryCertification({
        id: 456,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 101,
        badgeId: 789,
        complementaryCertificationId: 456,
        level: 1,
        label: 'Second badge expert',
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 102,
        badgeId: 456,
        complementaryCertificationId: 123,
        level: 2,
        label: 'First badge maître',
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 103,
        badgeId: 101112,
        complementaryCertificationId: 456,
        level: 2,
        label: 'Second badge maître',
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 104,
        badgeId: 123,
        complementaryCertificationId: 123,
        level: 1,
        label: 'First badge expert',
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 996,
        certificationCourseId,
        complementaryCertificationId: 123,
        complementaryCertificationBadgeId: 104,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 997,
        certificationCourseId,
        complementaryCertificationId: 456,
        complementaryCertificationBadgeId: 103,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 998,
        certificationCourseId,
        complementaryCertificationId: 123,
        complementaryCertificationBadgeId: 102,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 999,
        certificationCourseId,
        complementaryCertificationId: 456,
        complementaryCertificationBadgeId: 101,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 998,
        partnerKey: 'First badge expert',
        acquired: true,
        source: 'PIX',
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 996,
        partnerKey: 'First badge maître',
        acquired: true,
        source: 'PIX',
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 999,
        partnerKey: 'Second badge expert',
        acquired: true,
        source: 'PIX',
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 997,
        partnerKey: 'Second badge maître',
        acquired: true,
        source: 'PIX',
      });

      await databaseBuilder.commit();

      // when
      const [result] = await certificationResultRepository.findBySessionId({
        sessionId,
      });

      // then
      const expectedResult = [
        domainBuilder.buildComplementaryCertificationCourseResult({
          acquired: true,
          complementaryCertificationCourseId: 998,
          partnerKey: 'First badge expert',
          source: 'PIX',
          label: 'First badge expert',
        }),
        domainBuilder.buildComplementaryCertificationCourseResult({
          acquired: true,
          complementaryCertificationCourseId: 996,
          partnerKey: 'First badge maître',
          source: 'PIX',
          label: 'First badge maître',
        }),
        domainBuilder.buildComplementaryCertificationCourseResult({
          acquired: true,
          complementaryCertificationCourseId: 999,
          partnerKey: 'Second badge expert',
          source: 'PIX',
          label: 'Second badge expert',
        }),
        domainBuilder.buildComplementaryCertificationCourseResult({
          acquired: true,
          complementaryCertificationCourseId: 997,
          partnerKey: 'Second badge maître',
          source: 'PIX',
          label: 'Second badge maître',
        }),
      ];
      expect(result.complementaryCertificationCourseResults).to.deepEqualArray(expectedResult);
    });
  });

  describe('#findByCertificationCandidateIds', function () {
    it('should return all certification results linked to given certificationCandidateIds ordered by lastName, firstName', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const userId1 = databaseBuilder.factory.buildUser().id;
      const userId2 = databaseBuilder.factory.buildUser().id;
      const userId3 = databaseBuilder.factory.buildUser().id;
      const certificationCourseId1 = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        isPublished: true,
        isCancelled: false,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        sessionId,
        userId: userId1,
      }).id;
      const certificationCourseId2 = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Rupert',
        lastName: 'Giles',
        birthdate: '1964-03-15',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isCancelled: false,
        externalId: 'RIPPER',
        createdAt: new Date('2021-06-06'),
        sessionId,
        userId: userId2,
      }).id;
      const certificationCourseId3 = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Auffy',
        lastName: 'Summers',
        birthdate: '1981-01-01',
        birthplace: 'Salem',
        isPublished: true,
        isCancelled: true,
        externalId: 'WITCH',
        createdAt: new Date('2020-10-10'),
        sessionId,
        userId: userId3,
      }).id;
      const assessmentId1 = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId1,
      }).id;
      const assessmentId2 = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId2,
      }).id;
      databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId3,
      });
      const assessmentResultId1 = databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentId1,
        pixScore: 123,
        status: CertificationResult.status.VALIDATED,
        commentForOrganization: 'Un commentaire orga 1',
      }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentId2,
        pixScore: 0,
        status: CertificationResult.status.REJECTED,
        commentForOrganization: 'Un commentaire orga 2',
      });
      databaseBuilder.factory.buildCompetenceMark({
        id: 123,
        score: 10,
        level: 4,
        competence_code: '2.3',
        area_code: '2',
        competenceId: 'recComp23',
        assessmentResultId: assessmentResultId1,
      });
      const certificationCandidateId1 = databaseBuilder.factory.buildCertificationCandidate({
        userId: userId1,
        sessionId,
      }).id;
      const certificationCandidateId2 = databaseBuilder.factory.buildCertificationCandidate({
        userId: userId2,
        sessionId,
      }).id;
      const certificationCandidateId3 = databaseBuilder.factory.buildCertificationCandidate({
        userId: userId3,
        sessionId,
      }).id;
      const certificationCandidateIdNotInSession = databaseBuilder.factory.buildCertificationCandidate({
        userId: userId3,
      }).id;
      const certificationCandidateIdNoResult = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;
      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultRepository.findByCertificationCandidateIds({
        certificationCandidateIds: [
          certificationCandidateId1,
          certificationCandidateId2,
          certificationCandidateId3,
          certificationCandidateIdNotInSession,
          certificationCandidateIdNoResult,
        ],
      });

      // then
      const expectedFirstCertificationResult = domainBuilder.buildCertificationResult({
        id: certificationCourseId2,
        firstName: 'Rupert',
        lastName: 'Giles',
        birthdate: '1964-03-15',
        birthplace: 'Saint-Ouen',
        externalId: 'RIPPER',
        createdAt: new Date('2021-06-06'),
        sessionId,
        status: CertificationResult.status.REJECTED,
        pixScore: 0,
        commentForOrganization: 'Un commentaire orga 2',
        competencesWithMark: [],
        complementaryCertificationCourseResults: [],
      });
      const expectedSecondCertificationResult = domainBuilder.buildCertificationResult({
        id: certificationCourseId3,
        firstName: 'Auffy',
        lastName: 'Summers',
        birthdate: '1981-01-01',
        birthplace: 'Salem',
        externalId: 'WITCH',
        createdAt: new Date('2020-10-10'),
        sessionId,
        status: CertificationResult.status.CANCELLED,
        pixScore: null,
        commentForOrganization: null,
        competencesWithMark: [],
        complementaryCertificationCourseResults: [],
        emitter: null,
      });
      const expectedThirdCertificationResult = domainBuilder.buildCertificationResult({
        id: certificationCourseId1,
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        sessionId,
        status: CertificationResult.status.VALIDATED,
        pixScore: 123,
        commentForOrganization: 'Un commentaire orga 1',
        competencesWithMark: [
          domainBuilder.buildCompetenceMark({
            id: 123,
            score: 10,
            level: 4,
            competence_code: '2.3',
            area_code: '2',
            competenceId: 'recComp23',
            assessmentResultId: assessmentResultId1,
          }),
        ],
        complementaryCertificationCourseResults: [],
      });
      expect(certificationResults).to.deepEqualArray([
        expectedFirstCertificationResult,
        expectedSecondCertificationResult,
        expectedThirdCertificationResult,
      ]);
    });

    it('should ignore non published certifications', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        isPublished: false,
        isCancelled: false,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        sessionId,
        userId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({
        certificationCourseId,
      }).id;
      const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: 123,
        status: CertificationResult.status.VALIDATED,
        commentForOrganization: 'Un commentaire orga 1',
      }).id;
      databaseBuilder.factory.buildCompetenceMark({
        id: 123,
        score: 10,
        level: 4,
        competence_code: '2.3',
        area_code: '2',
        competenceId: 'recComp23',
        assessmentResultId,
      });
      const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({ userId, sessionId }).id;
      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultRepository.findByCertificationCandidateIds({
        certificationCandidateIds: [certificationCandidateId],
      });

      // then
      expect(certificationResults).to.be.empty;
    });

    it(`should return only complementary certifications of Pix source`, async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        isPublished: true,
        isCancelled: false,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        sessionId,
        userId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({
        certificationCourseId,
      }).id;
      const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: 123,
        status: CertificationResult.status.VALIDATED,
        commentForOrganization: 'Un commentaire orga 1',
      }).id;
      databaseBuilder.factory.buildCompetenceMark({
        id: 123,
        score: 10,
        level: 4,
        competence_code: '2.3',
        area_code: '2',
        competenceId: 'recComp23',
        assessmentResultId,
      });
      const edu1erDegreComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
        label: 'Pix+ Edu 1er degre',
      }).id;
      databaseBuilder.factory.buildBadge({ id: 12345, key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 997,
        certificationCourseId,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 997,
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
        acquired: true,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 997,
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
        acquired: true,
        source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: 12345,
        complementaryCertificationId: edu1erDegreComplementaryCertificationId,
        label: 'Pix+ Édu 1er degré Expert',
      });
      const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({ userId, sessionId }).id;
      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultRepository.findByCertificationCandidateIds({
        certificationCandidateIds: [certificationCandidateId],
      });

      // then
      const expectedResult = [
        domainBuilder.buildCertificationResult({
          id: certificationCourseId,
          firstName: 'Buffy',
          lastName: 'Summers',
          externalId: 'VAMPIRES_SUCK',
          pixScore: 123,
          sessionId,
          status: 'validated',
          birthdate: '1981-01-19',
          birthplace: 'Torreilles',
          createdAt: new Date('2020-01-01T00:00:00Z'),
          commentForOrganization: 'Un commentaire orga 1',
          competencesWithMark: [
            domainBuilder.buildCompetenceMark({
              id: 123,
              score: 10,
              level: 4,
              competence_code: '2.3',
              area_code: '2',
              competenceId: 'recComp23',
              assessmentResultId,
            }),
          ],
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: true,
              complementaryCertificationCourseId: 997,
              partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
              source: 'PIX',
              label: 'Pix+ Édu 1er degré Expert',
            }),
          ],
        }),
      ];
      expect(certificationResults).to.deepEqualArray(expectedResult);
    });

    it(`should return complementary certifications linked to the candidates`, async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const {
        certificationCandidateId: cleaCcertificationCandidateId,
        certificationCourseId: cleaCertificationCourseId,
        assessmentResultId: cleaAssessmentResultId,
        competenceMarkId: cleaCompetenceMarkId,
      } = await _buildCertificationResultWithCandidate(sessionId);
      databaseBuilder.factory.buildComplementaryCertification({ id: 333, name: 'CléA Numérique' });
      databaseBuilder.factory.buildBadge({ id: 12345, key: PIX_EMPLOI_CLEA_V1 });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 100,
        badgeId: 12345,
        complementaryCertificationId: 333,
        label: 'CléA Numérique',
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 998,
        certificationCourseId: cleaCertificationCourseId,
        complementaryCertificationBadgeId: 100,
        complementaryCertificationId: 333,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 998,
        partnerKey: PIX_EMPLOI_CLEA_V1,
        acquired: true,
        source: 'PIX',
      });

      const {
        certificationCandidateId: pixEdu1erDegreCertificationCandidateId,
        certificationCourseId: pixEdu1erDegreCertificationCourseId,
        assessmentResultId: pixEdu1erDegreAssessmentResultId,
        competenceMarkId: pixEdu1erDegreCompetenceMarkId,
      } = await _buildCertificationResultWithCandidate(sessionId);
      databaseBuilder.factory.buildComplementaryCertification({ id: 444, name: 'Pix+ Édu 1er degré' });
      databaseBuilder.factory.buildBadge({ id: 4567, key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 101,
        badgeId: 4567,
        complementaryCertificationId: 444,
        label: 'Pix+ Édu 1er degré Expert',
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 997,
        certificationCourseId: pixEdu1erDegreCertificationCourseId,
        complementaryCertificationBadgeId: 101,
        complementaryCertificationId: 444,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 997,
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
        acquired: false,
        source: 'PIX',
      });

      const {
        certificationCandidateId: pixEdu2ndDegreCertificationCandidateId,
        certificationCourseId: pixEdu2ndDegreCertificationCourseId,
        assessmentResultId: pixEdu2ndDegreAssessmentResultId,
        competenceMarkId: pixEdu2ndDegreCompetenceMarkId,
      } = await _buildCertificationResultWithCandidate(sessionId);
      databaseBuilder.factory.buildComplementaryCertification({ id: 555, name: 'Pix+ Édu 2nd degré' });
      databaseBuilder.factory.buildBadge({ id: 6789, key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 102,
        badgeId: 6789,
        complementaryCertificationId: 555,
        label: 'Pix+ Édu 2nd degré Confirmé',
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 996,
        certificationCourseId: pixEdu2ndDegreCertificationCourseId,
        complementaryCertificationBadgeId: 102,
        complementaryCertificationId: 555,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 996,
        partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
        acquired: true,
        source: 'PIX',
      });
      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultRepository.findByCertificationCandidateIds({
        certificationCandidateIds: [
          cleaCcertificationCandidateId,
          pixEdu1erDegreCertificationCandidateId,
          pixEdu2ndDegreCertificationCandidateId,
        ],
      });

      // then
      const expectedResult = [
        domainBuilder.buildCertificationResult({
          id: cleaCertificationCourseId,
          firstName: 'first-name',
          lastName: 'last-name',
          externalId: 'externalId',
          pixScore: 456,
          sessionId,
          status: 'validated',
          birthdate: '2001-05-21',
          birthplace: 'Paris',
          createdAt: new Date('2020-01-01T00:00:00Z'),
          commentForOrganization: 'Some comment for organization',
          competencesWithMark: [
            domainBuilder.buildCompetenceMark({
              id: cleaCompetenceMarkId,
              score: 42,
              level: 5,
              competence_code: '1.1',
              area_code: '1',
              competenceId: 'recABC123',
              assessmentResultId: cleaAssessmentResultId,
            }),
          ],
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: true,
              complementaryCertificationCourseId: 998,
              partnerKey: PIX_EMPLOI_CLEA_V1,
              source: 'PIX',
              label: 'CléA Numérique',
            }),
          ],
        }),
        domainBuilder.buildCertificationResult({
          id: pixEdu1erDegreCertificationCourseId,
          firstName: 'first-name',
          lastName: 'last-name',
          externalId: 'externalId',
          pixScore: 456,
          sessionId,
          status: 'validated',
          birthdate: '2001-05-21',
          birthplace: 'Paris',
          createdAt: new Date('2020-01-01T00:00:00Z'),
          commentForOrganization: 'Some comment for organization',
          competencesWithMark: [
            domainBuilder.buildCompetenceMark({
              id: pixEdu1erDegreCompetenceMarkId,
              score: 42,
              level: 5,
              competence_code: '1.1',
              area_code: '1',
              competenceId: 'recABC123',
              assessmentResultId: pixEdu1erDegreAssessmentResultId,
            }),
          ],
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: false,
              complementaryCertificationCourseId: 997,
              partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
              source: 'PIX',
              label: 'Pix+ Édu 1er degré Expert',
            }),
          ],
        }),
        domainBuilder.buildCertificationResult({
          id: pixEdu2ndDegreCertificationCourseId,
          firstName: 'first-name',
          lastName: 'last-name',
          externalId: 'externalId',
          pixScore: 456,
          sessionId,
          status: 'validated',
          birthdate: '2001-05-21',
          birthplace: 'Paris',
          createdAt: new Date('2020-01-01T00:00:00Z'),
          commentForOrganization: 'Some comment for organization',
          competencesWithMark: [
            domainBuilder.buildCompetenceMark({
              id: pixEdu2ndDegreCompetenceMarkId,
              score: 42,
              level: 5,
              competence_code: '1.1',
              area_code: '1',
              competenceId: 'recABC123',
              assessmentResultId: pixEdu2ndDegreAssessmentResultId,
            }),
          ],
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: true,
              complementaryCertificationCourseId: 996,
              partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
              source: 'PIX',
              label: 'Pix+ Édu 2nd degré Confirmé',
            }),
          ],
        }),
      ];
      expect(certificationResults).to.deepEqualArray(expectedResult);
    });
  });
});

async function _buildCertificationResultInSession(sessionId) {
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    sessionId,
    isPublished: true,
  }).id;
  const assessmentId = databaseBuilder.factory.buildAssessment({
    certificationCourseId,
  }).id;
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
  }).id;
  const competenceMarkId = databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId,
  }).id;
  await databaseBuilder.commit();
  return { certificationCourseId, assessmentResultId, competenceMarkId };
}

async function _buildCertificationResultWithCandidate(sessionId) {
  const userId = databaseBuilder.factory.buildUser().id;
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    sessionId,
    userId,
    isPublished: true,
  }).id;
  const assessmentId = databaseBuilder.factory.buildAssessment({
    certificationCourseId,
  }).id;
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
  }).id;
  const competenceMarkId = databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId,
  }).id;
  const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({
    sessionId,
    userId,
  }).id;
  await databaseBuilder.commit();
  return { certificationCourseId, certificationCandidateId, assessmentResultId, competenceMarkId };
}
