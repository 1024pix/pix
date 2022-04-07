const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const certificationResultRepository = require('../../../../lib/infrastructure/repositories/certification-result-repository');
const CertificationResult = require('../../../../lib/domain/models/CertificationResult');
const {
  PIX_EMPLOI_CLEA,
  PIX_EMPLOI_CLEA_V2,
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
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

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { complementaryCertificationName: 'CléA V1', badgeKey: PIX_EMPLOI_CLEA, validationFunction: 'hasAcquiredClea' },
      {
        complementaryCertificationName: 'CléA V2',
        badgeKey: PIX_EMPLOI_CLEA_V2,
        validationFunction: 'hasAcquiredClea',
      },
      {
        complementaryCertificationName: 'PixPlus Droit Maître',
        badgeKey: PIX_DROIT_MAITRE_CERTIF,
        validationFunction: 'hasAcquiredPixPlusDroitMaitre',
      },
      {
        complementaryCertificationName: 'PixPlus Droit Expert',
        badgeKey: PIX_DROIT_EXPERT_CERTIF,
        validationFunction: 'hasAcquiredPixPlusDroitExpert',
      },
      {
        complementaryCertificationName: 'PixPlus Édu Initié',
        badgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
        validationFunction: 'hasAcquiredPixPlusEduInitie',
      },
      {
        complementaryCertificationName: 'PixPlus Édu Confirmé',
        badgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
        validationFunction: 'hasAcquiredPixPlusEduConfirme',
      },
      {
        complementaryCertificationName: 'PixPlus Édu Confirmé',
        badgeKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
        validationFunction: 'hasAcquiredPixPlusEduConfirme',
      },
      {
        complementaryCertificationName: 'PixPlus Édu Avancé',
        badgeKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
        validationFunction: 'hasAcquiredPixPlusEduAvance',
      },
      {
        complementaryCertificationName: 'PixPlus Édu Expert',
        badgeKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
        validationFunction: 'hasAcquiredPixPlusEduExpert',
      },
    ].forEach(function (testCase) {
      it(`should get the ${testCase.complementaryCertificationName} result if this complementary certification was taken`, async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const certificationCourseId = await _buildCertificationResultInSession(sessionId);
        databaseBuilder.factory.buildBadge({ key: testCase.badgeKey });
        databaseBuilder.factory.buildComplementaryCertificationCourse({ id: 998, certificationCourseId });
        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 998,
          partnerKey: testCase.badgeKey,
          acquired: true,
        });
        await databaseBuilder.commit();

        // when
        const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

        // then
        expect(certificationResults).to.have.length(1);
        expect(certificationResults[0][testCase.validationFunction]()).to.be.true;
      });
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

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { complementaryCertificationName: 'CléA V1', badgeKey: PIX_EMPLOI_CLEA, validationFunction: 'hasAcquiredClea' },
      {
        complementaryCertificationName: 'CléA V2',
        badgeKey: PIX_EMPLOI_CLEA_V2,
        validationFunction: 'hasAcquiredClea',
      },
      {
        complementaryCertificationName: 'PixPlus Droit Maître',
        badgeKey: PIX_DROIT_MAITRE_CERTIF,
        validationFunction: 'hasAcquiredPixPlusDroitMaitre',
      },
      {
        complementaryCertificationName: 'PixPlus Droit Expert',
        badgeKey: PIX_DROIT_EXPERT_CERTIF,
        validationFunction: 'hasAcquiredPixPlusDroitExpert',
      },
      {
        complementaryCertificationName: 'PixPlus Édu Initié',
        badgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
        validationFunction: 'hasAcquiredPixPlusEduInitie',
      },
      {
        complementaryCertificationName: 'PixPlus Édu Confirmé',
        badgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
        validationFunction: 'hasAcquiredPixPlusEduConfirme',
      },
      {
        complementaryCertificationName: 'PixPlus Édu Confirmé',
        badgeKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
        validationFunction: 'hasAcquiredPixPlusEduConfirme',
      },
      {
        complementaryCertificationName: 'PixPlus Édu Avancé',
        badgeKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
        validationFunction: 'hasAcquiredPixPlusEduAvance',
      },
      {
        complementaryCertificationName: 'PixPlus Édu Expert',
        badgeKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
        validationFunction: 'hasAcquiredPixPlusEduExpert',
      },
    ].forEach(function (testCase) {
      it(`should get the ${testCase.complementaryCertificationName} result if this complementary certification was taken`, async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const { certificationCandidateId, certificationCourseId } = await _buildCertificationResultWithCandidate(
          sessionId
        );
        databaseBuilder.factory.buildBadge({ key: testCase.badgeKey });
        databaseBuilder.factory.buildComplementaryCertificationCourse({ id: 998, certificationCourseId });
        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 998,
          partnerKey: testCase.badgeKey,
          acquired: true,
        });
        await databaseBuilder.commit();

        // when
        const certificationResults = await certificationResultRepository.findByCertificationCandidateIds({
          certificationCandidateIds: [certificationCandidateId],
        });

        // then
        expect(certificationResults).to.have.length(1);
        expect(certificationResults[0][testCase.validationFunction]()).to.be.true;
      });
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
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId,
  });
  await databaseBuilder.commit();
  return certificationCourseId;
}

async function _buildCertificationResultWithCandidate() {
  const sessionId = databaseBuilder.factory.buildSession().id;
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
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId,
  });
  const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({
    sessionId,
    userId,
  }).id;
  await databaseBuilder.commit();
  return { certificationCourseId, certificationCandidateId };
}
