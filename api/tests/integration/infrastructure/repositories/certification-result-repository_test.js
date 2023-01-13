const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const certificationResultRepository = require('../../../../lib/infrastructure/repositories/certification-result-repository');
const CertificationResult = require('../../../../lib/domain/models/CertificationResult');
const ComplementaryCertificationCourseResult = require('../../../../lib/domain/models/ComplementaryCertificationCourseResult');

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
      databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseIdNotInSession,
      });
      const assessmentResultId1 = databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId: certificationCourseId1,
        pixScore: 123,
        status: CertificationResult.status.VALIDATED,
        commentForOrganization: 'Un commentaire orga 1',
      }).id;
      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId: certificationCourseId2,
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
      const { certificationCourseId, assessmentResultId, competenceMarkId } = await _buildCertificationResultInSession(
        sessionId
      );
      const oneBadgeId = databaseBuilder.factory.buildBadge({ key: 'PARTNER_KEY' }).id;
      const oneComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
        key: 'PARTNER_KEY',
      }).id;
      const oneComplementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: oneBadgeId,
        complementaryCertificationId: oneComplementaryCertificationId,
        label: 'PARTNER_LABEL',
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 998,
        certificationCourseId,
        complementaryCertificationId: oneComplementaryCertificationId,
        complementaryCertificationBadgeId: oneComplementaryCertificationBadgeId,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 998,
        partnerKey: 'PARTNER_KEY',
        acquired: true,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });

      const {
        certificationCourseId: otherDegreCertificationCourseId,
        assessmentResultId: otherAssessmentResultId,
        competenceMarkId: otherCompetenceMarkId,
      } = await _buildCertificationResultInSession(sessionId);
      const otherComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
      databaseBuilder.factory.buildBadge({ id: 12345, key: 'OTHER_PARTNER_KEY' });
      const otherComplementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: '12345',
        complementaryCertificationId: otherComplementaryCertificationId,
        label: 'OTHER_PARTNER_LABEL',
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 997,
        certificationCourseId: otherDegreCertificationCourseId,
        complementaryCertificationBadgeId: otherComplementaryCertificationBadgeId,
        complementaryCertificationId: otherComplementaryCertificationId,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 997,
        partnerKey: 'OTHER_PARTNER_KEY',
        acquired: false,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });

      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

      // then
      const expectedResult = [
        domainBuilder.buildCertificationResult({
          id: certificationCourseId,
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
              id: competenceMarkId,
              score: 42,
              level: 5,
              competence_code: '1.1',
              area_code: '1',
              competenceId: 'recABC123',
              assessmentResultId: assessmentResultId,
            }),
          ],
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: true,
              complementaryCertificationCourseId: 998,
              partnerKey: 'PARTNER_KEY',
              source: ComplementaryCertificationCourseResult.sources.PIX,
              label: 'PARTNER_LABEL',
            }),
          ],
        }),
        domainBuilder.buildCertificationResult({
          id: otherDegreCertificationCourseId,
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
              id: otherCompetenceMarkId,
              score: 42,
              level: 5,
              competence_code: '1.1',
              area_code: '1',
              competenceId: 'recABC123',
              assessmentResultId: otherAssessmentResultId,
            }),
          ],
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: false,
              complementaryCertificationCourseId: 997,
              partnerKey: 'OTHER_PARTNER_KEY',
              source: ComplementaryCertificationCourseResult.sources.PIX,
              label: 'OTHER_PARTNER_LABEL',
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
        certificationCourseId: oneCertificationCourseId,
        assessmentResultId: oneAssessmentResultId,
        competenceMarkId: oneCompetenceMarkId,
      } = await _buildCertificationResultInSession(sessionId);
      const oneComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
      databaseBuilder.factory.buildBadge({ id: 12345, key: 'PARTNER_KEY_PIX' });
      databaseBuilder.factory.buildBadge({ id: 12346, key: 'PARTNER_KEY_EXTERNAL' });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 997,
        certificationCourseId: oneCertificationCourseId,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 997,
        partnerKey: 'PARTNER_KEY_PIX',
        acquired: true,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 997,
        partnerKey: 'PARTNER_KEY_EXTERNAL',
        acquired: true,
        source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: 12345,
        complementaryCertificationId: oneComplementaryCertificationId,
        label: 'PARTNER_LABEL_PIX',
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: 12346,
        complementaryCertificationId: oneComplementaryCertificationId,
        label: 'PARTNER_LABEL_EXTERNAL',
      });

      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

      // then
      const expectedResult = [
        domainBuilder.buildCertificationResult({
          id: oneCertificationCourseId,
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
              id: oneCompetenceMarkId,
              score: 42,
              level: 5,
              competence_code: '1.1',
              area_code: '1',
              competenceId: 'recABC123',
              assessmentResultId: oneAssessmentResultId,
            }),
          ],
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: true,
              complementaryCertificationCourseId: 997,
              partnerKey: 'PARTNER_KEY_PIX',
              source: ComplementaryCertificationCourseResult.sources.PIX,
              label: 'PARTNER_LABEL_PIX',
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
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 996,
        partnerKey: 'First badge maître',
        acquired: true,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 999,
        partnerKey: 'Second badge expert',
        acquired: true,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 997,
        partnerKey: 'Second badge maître',
        acquired: true,
        source: ComplementaryCertificationCourseResult.sources.PIX,
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
          source: ComplementaryCertificationCourseResult.sources.PIX,
          label: 'First badge expert',
        }),
        domainBuilder.buildComplementaryCertificationCourseResult({
          acquired: true,
          complementaryCertificationCourseId: 996,
          partnerKey: 'First badge maître',
          source: ComplementaryCertificationCourseResult.sources.PIX,
          label: 'First badge maître',
        }),
        domainBuilder.buildComplementaryCertificationCourseResult({
          acquired: true,
          complementaryCertificationCourseId: 999,
          partnerKey: 'Second badge expert',
          source: ComplementaryCertificationCourseResult.sources.PIX,
          label: 'Second badge expert',
        }),
        domainBuilder.buildComplementaryCertificationCourseResult({
          acquired: true,
          complementaryCertificationCourseId: 997,
          partnerKey: 'Second badge maître',
          source: ComplementaryCertificationCourseResult.sources.PIX,
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

      const assessmentResultId1 = databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId: certificationCourseId1,
        pixScore: 123,
        status: CertificationResult.status.VALIDATED,
        commentForOrganization: 'Un commentaire orga 1',
      }).id;
      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId: certificationCourseId2,
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
      const assessmentResultId = databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId,
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
      const oneComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
        label: 'PARTNER_LABEL',
      }).id;
      databaseBuilder.factory.buildBadge({ id: 12345, key: 'PARTNER_KEY' });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 997,
        certificationCourseId,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 997,
        partnerKey: 'PARTNER_KEY',
        acquired: true,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 997,
        partnerKey: 'PARTNER_KEY',
        acquired: true,
        source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: 12345,
        complementaryCertificationId: oneComplementaryCertificationId,
        label: 'PARTNER_LABEL',
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
              partnerKey: 'PARTNER_KEY',
              source: ComplementaryCertificationCourseResult.sources.PIX,
              label: 'PARTNER_LABEL',
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
        certificationCandidateId: oneCertificationCandidateId,
        certificationCourseId: oneCertificationCourseId,
        assessmentResultId: assessmentResultId,
        competenceMarkId: competenceMarkId,
      } = await _buildCertificationResultWithCandidate(sessionId);
      databaseBuilder.factory.buildComplementaryCertification({ id: 333 });
      databaseBuilder.factory.buildBadge({ id: 12345, key: 'PARTNER_KEY' });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 100,
        badgeId: 12345,
        complementaryCertificationId: 333,
        label: 'PARTNER_LABEL',
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 998,
        certificationCourseId: oneCertificationCourseId,
        complementaryCertificationBadgeId: 100,
        complementaryCertificationId: 333,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 998,
        partnerKey: 'PARTNER_KEY',
        acquired: true,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });

      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultRepository.findByCertificationCandidateIds({
        certificationCandidateIds: [oneCertificationCandidateId],
      });

      // then
      const expectedResult = [
        domainBuilder.buildCertificationResult({
          id: oneCertificationCourseId,
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
              id: competenceMarkId,
              score: 42,
              level: 5,
              competence_code: '1.1',
              area_code: '1',
              competenceId: 'recABC123',
              assessmentResultId: assessmentResultId,
            }),
          ],
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: true,
              complementaryCertificationCourseId: 998,
              partnerKey: 'PARTNER_KEY',
              source: ComplementaryCertificationCourseResult.sources.PIX,
              label: 'PARTNER_LABEL',
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
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId,
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

  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId,
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
