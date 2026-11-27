import { expect } from 'chai';
import type { Knex } from 'knex';

import {
  CertificationResult,
  UserCertificationResult,
} from '../../../../../../src/certification/results/domain/models/NewCertificationResult.ts';
import * as newCertificationResultRepository from '../../../../../../src/certification/results/infrastructure/repositories/new-certification-result-repository.ts';
import { PIX_PLUS_EDU_EXTERNAL_LEVELS } from '../../../../../../src/certification/shared/domain/constants/mesh-configuration.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

type Row = Record<string, unknown>;
type CertificationResultData = Row & { competenceMarks?: unknown };
type UserCertificationResultData = ConstructorParameters<typeof UserCertificationResult>[0];

const knexConn = knex as Knex;
// domainBuilder.certification is inferred as `any` (builders import the domainBuilder index: circular inference).
const certificationDomainBuilder = domainBuilder.certification as {
  results: { buildNewCertificationResult: (data: CertificationResultData) => CertificationResult };
};

describe('Certification | Results | Integration | Infrastructure | Repository | New Certification Result', function () {
  describe('#save', function () {
    let certificationResultData1: CertificationResultData,
      certificationResultData2: CertificationResultData,
      certificationResultData3: CertificationResultData,
      certificationResultData4: CertificationResultData;
    const expectedCompetenceResults: Row[] = [];
    let userCertificationResultData1: UserCertificationResultData,
      userCertificationResultData2: UserCertificationResultData,
      userCertificationResultData3: UserCertificationResultData,
      userCertificationResultData4: UserCertificationResultData;
    beforeEach(function () {
      certificationResultData1 = {
        id: '10000001-1001-1001-1001-100000000001',
        algorithmEngineVersion: AlgorithmEngineVersion.V3,
        firstName: 'Buffy',
        middleName: null,
        thirdName: null,
        lastName: 'Summers',
        externalId: null,
        nationalStudentId: 'some student id',
        birthdate: '1981-01-18',
        birthplace: 'Sunnydale',
        birthPostalCode: null,
        birthINSEECode: '99001',
        birthCountry: 'États-Unis',
        verificationCode: 'VERIFCODE',
        certificationCenter: 'Centre certification le meilleur',
        startedAt: new Date('2025-12-30'),
        deliveredAt: new Date('2025-12-31'),
        status: 'validated',
        framework: Frameworks.CORE,
        franceCompetencesMinScore: 120,
        commentByAutoJury: 'commentByAutoJury',
        commentByJury: 'commentByJury',
        commentForOrganization: 'commentForOrganization',
        commentForCandidate: 'commentForCandidate',
        maxReachableLevel: 7,
        pixScore: 678,
        reachedMeshIndex: 3,
        competenceMarks: [
          {
            level: 1,
            competenceId: 'competenceABC123',
          },
          {
            level: 7,
            competenceId: 'competenceDEF456',
          },
        ],
        v3EduExternalJuryResult: null,
        hasAcquiredClea: null,
        cleaBadgeId: null,
        v2EduVoletExterneAcquired: null,
        v2EduVoletExterneBadgeId: null,
        v2ComplementaryVoletPixAcquired: null,
        v2ComplementaryVoletPixBadgeId: null,
      };
      expectedCompetenceResults.push(
        ...[
          {
            certificationResultId: '10000001-1001-1001-1001-100000000001',
            level: 1,
            competenceId: 'competenceABC123',
          },
          {
            certificationResultId: '10000001-1001-1001-1001-100000000001',
            level: 7,
            competenceId: 'competenceDEF456',
          },
        ],
      );
      certificationResultData2 = {
        id: '20000002-2002-2002-2002-200000000002',
        algorithmEngineVersion: AlgorithmEngineVersion.V3,
        firstName: 'Rupert',
        middleName: 'Ru',
        thirdName: 'Pert',
        lastName: 'Giles',
        externalId: 'MagicBox',
        nationalStudentId: null,
        birthdate: '1956-02-22',
        birthplace: 'Pézila-la-rivière',
        birthPostalCode: '66370',
        birthINSEECode: null,
        birthCountry: 'France',
        verificationCode: 'CODEVERIF',
        certificationCenter: 'Centre certification anglais',
        startedAt: new Date('2026-11-01'),
        deliveredAt: new Date('2026-12-01'),
        status: 'cancelled',
        framework: Frameworks.EDU_CPE,
        franceCompetencesMinScore: null,
        commentByAutoJury: 'commentByAutoJury',
        commentByJury: 'commentByJury',
        commentForOrganization: 'commentForOrganization',
        commentForCandidate: 'commentForCandidate',
        v3EduExternalJuryResult: 'REALLY BAD',
        reachedMeshIndex: 2,
        maxReachableLevel: null,
        pixScore: null,
        competenceMarks: null,
        hasAcquiredClea: null,
        cleaBadgeId: null,
        v2EduVoletExterneAcquired: null,
        v2EduVoletExterneBadgeId: null,
        v2ComplementaryVoletPixAcquired: null,
        v2ComplementaryVoletPixBadgeId: null,
      };
      certificationResultData3 = {
        id: '30000003-3003-3003-3003-300000000003',
        algorithmEngineVersion: AlgorithmEngineVersion.V3,
        firstName: 'Mamie',
        middleName: 'Ma',
        thirdName: null,
        lastName: 'Nova',
        externalId: null,
        nationalStudentId: null,
        birthdate: '1956-02-22',
        birthplace: 'Kelkepart',
        birthPostalCode: null,
        birthINSEECode: '66170',
        birthCountry: 'France',
        verificationCode: 'CODEVERIF3',
        certificationCenter: 'Centre certification de la campagne',
        startedAt: new Date('2026-11-01'),
        deliveredAt: new Date('2026-12-01'),
        status: 'validated',
        framework: Frameworks.CLEA,
        franceCompetencesMinScore: 123,
        commentByAutoJury: 'commentByAutoJury',
        commentByJury: 'commentByJury',
        commentForOrganization: 'commentForOrganization',
        commentForCandidate: 'commentForCandidate',
        maxReachableLevel: 7,
        pixScore: 123,
        reachedMeshIndex: 2,
        competenceMarks: [
          {
            level: 1,
            competenceId: 'competenceABC123',
          },
          {
            level: 7,
            competenceId: 'competenceDEF456',
          },
        ],
        hasAcquiredClea: true,
        cleaBadgeId: 444,
        v3EduExternalJuryResult: null,
        v2EduVoletExterneAcquired: null,
        v2EduVoletExterneBadgeId: null,
        v2ComplementaryVoletPixAcquired: null,
        v2ComplementaryVoletPixBadgeId: null,
      };
      expectedCompetenceResults.push(
        ...[
          {
            certificationResultId: '30000003-3003-3003-3003-300000000003',
            level: 1,
            competenceId: 'competenceABC123',
          },
          {
            certificationResultId: '30000003-3003-3003-3003-300000000003',
            level: 7,
            competenceId: 'competenceDEF456',
          },
        ],
      );
      certificationResultData4 = {
        id: '40000004-4004-4004-4004-400000000004',
        algorithmEngineVersion: AlgorithmEngineVersion.V2,
        firstName: 'Joe',
        middleName: 'La',
        thirdName: 'Mouche',
        lastName: 'Duran',
        externalId: 'Random',
        nationalStudentId: null,
        birthdate: '1956-04-24',
        birthplace: 'Pézila-la-rivière',
        birthPostalCode: '66370',
        birthINSEECode: null,
        birthCountry: 'France',
        verificationCode: 'CODEVERIF',
        certificationCenter: 'Centre certification joelamouche',
        startedAt: new Date('2026-11-01'),
        deliveredAt: new Date('2026-12-01'),
        status: 'validated',
        framework: Frameworks.EDU_2ND_DEGRE,
        franceCompetencesMinScore: null,
        commentByAutoJury: 'commentByAutoJury',
        commentByJury: 'commentByJury',
        commentForOrganization: 'commentForOrganization',
        commentForCandidate: 'commentForCandidate',
        v3EduExternalJuryResult: null,
        maxReachableLevel: null,
        reachedMeshIndex: null,
        pixScore: 123,
        competenceMarks: [
          {
            level: 3,
            competenceId: 'competenceGGG123',
          },
          {
            level: 4,
            competenceId: 'competenceMMM456',
          },
        ],
        hasAcquiredClea: null,
        cleaBadgeId: null,
        v2EduVoletExterneAcquired: true,
        v2EduVoletExterneBadgeId: 123,
        v2ComplementaryVoletPixAcquired: true,
        v2ComplementaryVoletPixBadgeId: 456,
      };
      expectedCompetenceResults.push(
        ...[
          {
            certificationResultId: '40000004-4004-4004-4004-400000000004',
            level: 3,
            competenceId: 'competenceGGG123',
          },
          {
            certificationResultId: '40000004-4004-4004-4004-400000000004',
            level: 4,
            competenceId: 'competenceMMM456',
          },
        ],
      );
      userCertificationResultData1 = {
        certificationResultId: '10000001-1001-1001-1001-100000000001',
        userId: databaseBuilder.factory.buildUser().id,
        sessionId: databaseBuilder.factory.buildSession().id,
        certificationCourseId: databaseBuilder.factory.buildCertificationCourse().id,
        organizationLearnerId: databaseBuilder.factory.buildOrganizationLearner().id,
      };
      userCertificationResultData2 = {
        certificationResultId: '20000002-2002-2002-2002-200000000002',
        userId: databaseBuilder.factory.buildUser().id,
        sessionId: null,
        certificationCourseId: null,
        organizationLearnerId: null,
      };
      userCertificationResultData3 = {
        certificationResultId: '30000003-3003-3003-3003-300000000003',
        userId: databaseBuilder.factory.buildUser().id,
        sessionId: databaseBuilder.factory.buildSession().id,
        certificationCourseId: databaseBuilder.factory.buildCertificationCourse().id,
        organizationLearnerId: null,
      };
      userCertificationResultData4 = {
        certificationResultId: '40000004-4004-4004-4004-400000000004',
        userId: databaseBuilder.factory.buildUser().id,
        sessionId: databaseBuilder.factory.buildSession().id,
        certificationCourseId: databaseBuilder.factory.buildCertificationCourse().id,
        organizationLearnerId: null,
      };
      return databaseBuilder.commit();
    });

    it('saves CertificationResults, CertificationCompetenceResults, UserCertificationResults', async function () {
      const certificationResult1 =
        certificationDomainBuilder.results.buildNewCertificationResult(certificationResultData1);
      const certificationResult2 =
        certificationDomainBuilder.results.buildNewCertificationResult(certificationResultData2);
      const certificationResult3 =
        certificationDomainBuilder.results.buildNewCertificationResult(certificationResultData3);
      const certificationResult4 =
        certificationDomainBuilder.results.buildNewCertificationResult(certificationResultData4);
      const userCertificationResult1 = new UserCertificationResult(userCertificationResultData1);
      const userCertificationResult2 = new UserCertificationResult(userCertificationResultData2);
      const userCertificationResult3 = new UserCertificationResult(userCertificationResultData3);
      const userCertificationResult4 = new UserCertificationResult(userCertificationResultData4);

      await newCertificationResultRepository.save({
        certificationResults: [certificationResult1, certificationResult2, certificationResult3, certificationResult4],
        userCertificationResults: [
          userCertificationResult1,
          userCertificationResult2,
          userCertificationResult3,
          userCertificationResult4,
        ],
      });

      const actualUserCertificationResults = await knexConn('user_certification_results')
        .select('*')
        .orderBy('certificationResultId');
      expect(withoutTimestamps(actualUserCertificationResults)).to.deep.equal([
        userCertificationResultData1,
        userCertificationResultData2,
        userCertificationResultData3,
        userCertificationResultData4,
      ]);
      delete certificationResultData1.competenceMarks;
      delete certificationResultData2.competenceMarks;
      delete certificationResultData3.competenceMarks;
      delete certificationResultData4.competenceMarks;
      const actualCertificationResults = await knexConn('certification_results').select('*').orderBy('id');
      expect(withoutTimestamps(actualCertificationResults)).to.deep.equal([
        certificationResultData1,
        certificationResultData2,
        certificationResultData3,
        certificationResultData4,
      ]);
      const actualCompetenceResults = await knexConn('certification_competence_results')
        .select('*')
        .orderBy(['certificationResultId', 'competenceId']);
      expect(withoutTimestamps(actualCompetenceResults)).to.deep.equal(expectedCompetenceResults);
    });

    it('does nothing when nothing to save', async function () {
      await newCertificationResultRepository.save({
        certificationResults: [],
        userCertificationResults: [],
      });

      const actualUserCertificationResults = await knexConn('user_certification_results')
        .select('*')
        .orderBy('certificationResultId');
      expect(actualUserCertificationResults).to.have.lengthOf(0);
      const actualCertificationResults = await knexConn('certification_results').select('*').orderBy('id');
      expect(actualCertificationResults).to.have.lengthOf(0);
      const actualCertificationCompetenceResults = await knexConn('certification_competence_results').select('*');
      expect(actualCertificationCompetenceResults).to.have.lengthOf(0);
    });
  });

  describe('#deleteBySession', function () {
    it('deletes the certification results of the given session only', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const otherSessionId = databaseBuilder.factory.buildSession().id;
      buildResultInSession(sessionId);
      buildResultInSession(sessionId);
      const otherResultId = buildResultInSession(otherSessionId);
      await databaseBuilder.commit();

      // when
      await newCertificationResultRepository.deleteBySession(sessionId);

      // then
      const remainingUserCertificationResults =
        await knexConn('user_certification_results').pluck('certificationResultId');
      expect(remainingUserCertificationResults).to.deep.equal([otherResultId]);
      const remainingCertificationResults = await knexConn('certification_results').pluck('id');
      expect(remainingCertificationResults).to.deep.equal([otherResultId]);
      const remainingCompetenceResults = await knexConn('certification_competence_results').pluck(
        'certificationResultId',
      );
      expect(remainingCompetenceResults).to.deep.equal([otherResultId]);
    });

    it('does nothing when the session has no certification result', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const otherSessionId = databaseBuilder.factory.buildSession().id;
      const otherResultId = buildResultInSession(otherSessionId);
      await databaseBuilder.commit();

      // when
      await newCertificationResultRepository.deleteBySession(sessionId);

      // then
      expect(await knexConn('user_certification_results').pluck('certificationResultId')).to.deep.equal([
        otherResultId,
      ]);
      expect(await knexConn('certification_results').pluck('id')).to.deep.equal([otherResultId]);
      expect(await knexConn('certification_competence_results').pluck('certificationResultId')).to.deep.equal([
        otherResultId,
      ]);
    });
  });
  describe('#getByCertificationCourseId', function () {
    it('returns the certification result of the given certification course', async function () {
      // given
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse();
      const certificationResult = databaseBuilder.factory.buildCertificationResult({
        competenceMarks: [
          { competenceId: 'competenceDEF456', level: 5 },
          { competenceId: 'competenceABC123', level: 2 },
        ],
      });
      databaseBuilder.factory.buildUserCertificationResult({
        certificationResultId: certificationResult.id,
        certificationCourseId: certificationCourse.id,
        userId: certificationCourse.userId,
      });
      await databaseBuilder.commit();

      // when
      const foundCertificationResult = await newCertificationResultRepository.getByCertificationCourseId(
        certificationCourse.id,
      );

      // then
      expect(foundCertificationResult).to.deep.equal(
        certificationDomainBuilder.results.buildNewCertificationResult({
          ...certificationResult,
          competenceMarks: [
            { competenceId: 'competenceABC123', level: 2 },
            { competenceId: 'competenceDEF456', level: 5 },
          ],
        }),
      );
    });

    it('returns null when the certification course has no certification result', async function () {
      // given
      const certificationCourseWithoutResult = databaseBuilder.factory.buildCertificationCourse();
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse();
      const certificationResult = databaseBuilder.factory.buildCertificationResult();
      databaseBuilder.factory.buildUserCertificationResult({
        certificationResultId: certificationResult.id,
        certificationCourseId: certificationCourse.id,
        userId: certificationCourse.userId,
      });
      await databaseBuilder.commit();

      // when
      const foundCertificationResult = await newCertificationResultRepository.getByCertificationCourseId(
        certificationCourseWithoutResult.id,
      );

      // then
      expect(foundCertificationResult).to.equal(null);
    });
  });

  describe('#updateEduV3ExternalJuryResult', function () {
    it('updates the external jury result and the update date', async function () {
      // given
      const certificationResult = databaseBuilder.factory.buildCertificationResult({
        v3EduExternalJuryResult: null,
      });
      await databaseBuilder.commit();

      // when
      await newCertificationResultRepository.updateEduV3ExternalJuryResult({
        certificationResultId: certificationResult.id,
        newExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
      });

      // then
      const updatedCertificationResult = await knexConn('certification_results')
        .where({ id: certificationResult.id })
        .first<{ updatedAt: Date }>();
      expect(updatedCertificationResult).to.deep.equal({
        ...certificationResult,
        v3EduExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
        updatedAt: updatedCertificationResult.updatedAt,
      });
      expect(updatedCertificationResult.updatedAt).to.be.above(certificationResult.updatedAt);
    });

    it('resets the external jury result when given null', async function () {
      // given
      const certificationResult = databaseBuilder.factory.buildCertificationResult({
        v3EduExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
      });
      await databaseBuilder.commit();

      // when
      await newCertificationResultRepository.updateEduV3ExternalJuryResult({
        certificationResultId: certificationResult.id,
        newExternalJuryResult: null,
      });

      // then
      const updatedCertificationResult = await knexConn('certification_results')
        .where({ id: certificationResult.id })
        .first<{ updatedAt: Date }>();
      expect(updatedCertificationResult).to.deep.equal({
        ...certificationResult,
        v3EduExternalJuryResult: null,
        updatedAt: updatedCertificationResult.updatedAt,
      });
      expect(updatedCertificationResult.updatedAt).to.be.above(certificationResult.updatedAt);
    });
  });

  describe('#updateEduV2ExternalJuryResult', function () {
    it('updates the external jury result and the update date', async function () {
      // given
      const certificationResult = databaseBuilder.factory.buildCertificationResult({
        algorithmEngineVersion: AlgorithmEngineVersion.V2,
        v2EduVoletExterneBadgeId: null,
        v2EduVoletExterneAcquired: null,
      });
      await databaseBuilder.commit();

      // when
      await newCertificationResultRepository.updateEduV2ExternalJuryResult({
        certificationResultId: certificationResult.id,
        v2EduVoletExterneBadgeId: 123,
        v2EduVoletExterneAcquired: true,
      });

      // then
      const updatedCertificationResult = await knexConn('certification_results')
        .where({ id: certificationResult.id })
        .first<{ updatedAt: Date }>();
      expect(updatedCertificationResult).to.deep.equal({
        ...certificationResult,
        v2EduVoletExterneBadgeId: 123,
        v2EduVoletExterneAcquired: true,
        updatedAt: updatedCertificationResult.updatedAt,
      });
      expect(updatedCertificationResult.updatedAt).to.be.above(certificationResult.updatedAt);
    });

    it('resets the external jury result when given null values', async function () {
      // given
      const certificationResult = databaseBuilder.factory.buildCertificationResult({
        algorithmEngineVersion: AlgorithmEngineVersion.V2,
        v2EduVoletExterneBadgeId: 123,
        v2EduVoletExterneAcquired: true,
      });
      await databaseBuilder.commit();

      // when
      await newCertificationResultRepository.updateEduV2ExternalJuryResult({
        certificationResultId: certificationResult.id,
        v2EduVoletExterneBadgeId: null,
        v2EduVoletExterneAcquired: null,
      });

      // then
      const updatedCertificationResult = await knexConn('certification_results')
        .where({ id: certificationResult.id })
        .first<{ updatedAt: Date }>();
      expect(updatedCertificationResult).to.deep.equal({
        ...certificationResult,
        v2EduVoletExterneBadgeId: null,
        v2EduVoletExterneAcquired: null,
        updatedAt: updatedCertificationResult.updatedAt,
      });
      expect(updatedCertificationResult.updatedAt).to.be.above(certificationResult.updatedAt);
    });
  });
});

function buildResultInSession(sessionId: number): string {
  const certificationCourse = databaseBuilder.factory.buildCertificationCourse({ sessionId });
  const certificationResultId = databaseBuilder.factory.buildCertificationResult({
    competenceMarks: [{ competenceId: 'competenceABC123', level: 2 }],
  }).id;
  databaseBuilder.factory.buildUserCertificationResult({
    certificationResultId,
    userId: certificationCourse.userId,
    sessionId,
    certificationCourseId: certificationCourse.id,
  });
  return certificationResultId;
}

function withoutTimestamps(rows: unknown[]): Row[] {
  return (rows as Row[]).map(({ createdAt, updatedAt, ...row }) => {
    expect(createdAt).to.be.instanceOf(Date);
    if (updatedAt !== undefined) {
      expect(updatedAt).to.be.instanceOf(Date);
    }
    return row;
  });
}
