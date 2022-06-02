const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const certificationResultRepository = require('../../../../lib/infrastructure/repositories/certification-result-repository');
const CertificationResult = require('../../../../lib/domain/models/CertificationResult');
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
      }).id;
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
      databaseBuilder.factory.buildBadge({ key: PIX_EMPLOI_CLEA_V1 });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 998,
        certificationCourseId: cleaCertificationCourseId,
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
      databaseBuilder.factory.buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 997,
        certificationCourseId: pixEdu1erDegreCertificationCourseId,
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
      databaseBuilder.factory.buildBadge({ key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 996,
        certificationCourseId: pixEdu2ndDegreCertificationCourseId,
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
            }),
          ],
        }),
      ];
      expect(certificationResults).to.deepEqualArray(expectedResult);
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
      }).id;
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

    it(`should return complementary certifications linked to the candidates`, async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const {
        certificationCandidateId: cleaCcertificationCandidateId,
        certificationCourseId: cleaCertificationCourseId,
        assessmentResultId: cleaAssessmentResultId,
        competenceMarkId: cleaCompetenceMarkId,
      } = await _buildCertificationResultWithCandidate(sessionId);
      databaseBuilder.factory.buildBadge({ key: PIX_EMPLOI_CLEA_V1 });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 998,
        certificationCourseId: cleaCertificationCourseId,
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
      databaseBuilder.factory.buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 997,
        certificationCourseId: pixEdu1erDegreCertificationCourseId,
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
      databaseBuilder.factory.buildBadge({ key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 996,
        certificationCourseId: pixEdu2ndDegreCertificationCourseId,
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
