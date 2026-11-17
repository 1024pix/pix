import { expect } from 'chai';

import { CERTIFICATION_RESULT_STATUSES } from '../../../../../../src/certification/results/domain/constants.ts';
import { CertificationResultForCsv } from '../../../../../../src/certification/results/domain/read-models/CertificationResultForCsv.ts';
import * as certificationResultForCsvRepository from '../../../../../../src/certification/results/infrastructure/repositories/certification-result-for-csv-repository.ts';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { AutoJuryCommentKeys } from '../../../../../../src/certification/shared/domain/models/JuryComment.js';
import type { Framework } from '../../../../../../src/certification/shared/domain/types.ts';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Certification | Results | Integration | Infrastructure | Repository | Certification Result For Csv', function () {
  describe('#findBySessionAndResultRecipient', function () {
    it('returns all certification results for given session and result recipient email', async function () {
      // given
      const resultRecipientEmail = 'lepatron@example.net';
      const sessionId = databaseBuilder.factory.buildSession().id;
      const anotherSessionId = databaseBuilder.factory.buildSession().id;
      databaseBuilder.factory.learningContent.buildCompetence({ id: 'competenceABC123', index: '1.1', origin: 'Pix' });
      databaseBuilder.factory.learningContent.buildCompetence({ id: 'competenceDEF456', index: '2.2', origin: 'Pix' });
      const expectedResultData1 = buildCertificationResultForSessionAndResultRecipient(
        1,
        Frameworks.CORE,
        sessionId,
        resultRecipientEmail,
      );
      buildCertificationResultForSessionAndResultRecipient(2, Frameworks.CORE, anotherSessionId, resultRecipientEmail); // noise
      buildCertificationResultForSessionAndResultRecipient(3, Frameworks.CORE, sessionId, 'someoneelse@example.net'); // noise
      const expectedResultData2 = buildCertificationResultForSessionAndResultRecipient(
        4,
        Frameworks.CLEA,
        sessionId,
        resultRecipientEmail,
      );
      const expectedResultData3 = buildCertificationResultForSessionAndResultRecipient(
        5,
        Frameworks.DROIT,
        sessionId,
        resultRecipientEmail,
      );
      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultForCsvRepository.findBySessionAndResultRecipient({
        sessionId,
        resultRecipientEmail,
      });

      // then
      expect(certificationResults).to.deep.equal([
        new CertificationResultForCsv(expectedResultData1),
        new CertificationResultForCsv(expectedResultData2),
        new CertificationResultForCsv(expectedResultData3),
      ]);
    });

    it('returns an empty array if no certification found for given session and result recipient email', async function () {
      // given
      const resultRecipientEmail = 'lepatron@example.net';
      const sessionId = databaseBuilder.factory.buildSession().id;
      const anotherSessionId = databaseBuilder.factory.buildSession().id;
      databaseBuilder.factory.learningContent.buildCompetence({ id: 'competenceABC123', index: '1.1', origin: 'Pix' });
      databaseBuilder.factory.learningContent.buildCompetence({ id: 'competenceDEF456', index: '2.2', origin: 'Pix' });
      buildCertificationResultForSessionAndResultRecipient(2, Frameworks.CORE, anotherSessionId, resultRecipientEmail);
      buildCertificationResultForSessionAndResultRecipient(3, Frameworks.CORE, sessionId, 'someoneelse@example.net');
      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultForCsvRepository.findBySessionAndResultRecipient({
        sessionId,
        resultRecipientEmail,
      });

      // then
      expect(certificationResults).to.deep.equal([]);
    });
  });

  describe('#findMostRecentByLearners', function () {
    beforeEach(function () {
      databaseBuilder.factory.buildOrganizationLearner({ id: 10 });
      databaseBuilder.factory.buildOrganizationLearner({ id: 20 });
      databaseBuilder.factory.buildOrganizationLearner({ id: 30 });
      databaseBuilder.factory.buildOrganizationLearner({ id: 40 });
      databaseBuilder.factory.buildOrganizationLearner({ id: 50 });
      return databaseBuilder.commit();
    });

    it('returns all certification results for given learners ordered by last name and first name', async function () {
      // given
      databaseBuilder.factory.learningContent.buildCompetence({ id: 'competenceABC123', index: '1.1', origin: 'Pix' });
      databaseBuilder.factory.learningContent.buildCompetence({ id: 'competenceDEF456', index: '2.2', origin: 'Pix' });
      const expectedResultData1 = buildCertificationResultForLearner(1, Frameworks.CORE, 50, new Date());
      buildCertificationResultForLearner(2, Frameworks.CORE, 20, new Date()); // noise
      buildCertificationResultForLearner(3, Frameworks.CORE, null, new Date()); // noise
      const expectedResultData2 = buildCertificationResultForLearner(4, Frameworks.CLEA, 10, new Date());
      const expectedResultData3 = buildCertificationResultForLearner(5, Frameworks.DROIT, 40, new Date());
      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultForCsvRepository.findMostRecentByLearners({
        learnerIds: [10, 40, 50, 999],
      });

      // then
      expect(certificationResults).to.deep.equal([
        new CertificationResultForCsv(expectedResultData1),
        new CertificationResultForCsv(expectedResultData2),
        new CertificationResultForCsv(expectedResultData3),
      ]);
    });

    it('returns the certification result for which certification started the most recently per learner', async function () {
      // given
      databaseBuilder.factory.learningContent.buildCompetence({ id: 'competenceABC123', index: '1.1', origin: 'Pix' });
      databaseBuilder.factory.learningContent.buildCompetence({ id: 'competenceDEF456', index: '2.2', origin: 'Pix' });
      const expectedResultData1 = buildCertificationResultForLearner(1, Frameworks.CORE, 10, new Date('2026-01-01'));
      buildCertificationResultForLearner(2, Frameworks.CORE, 10, new Date('2025-12-31'));
      buildCertificationResultForLearner(3, Frameworks.CLEA, 20, new Date('2026-02-10'));
      const expectedResultData2 = buildCertificationResultForLearner(4, Frameworks.CLEA, 20, new Date());
      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultForCsvRepository.findMostRecentByLearners({
        learnerIds: [10, 20],
      });

      // then
      expect(certificationResults).to.deep.equal([
        new CertificationResultForCsv(expectedResultData1),
        new CertificationResultForCsv(expectedResultData2),
      ]);
    });

    it('returns an empty array if no certification found for given learners', async function () {
      // given
      databaseBuilder.factory.learningContent.buildCompetence({ id: 'competenceABC123', index: '1.1', origin: 'Pix' });
      databaseBuilder.factory.learningContent.buildCompetence({ id: 'competenceDEF456', index: '2.2', origin: 'Pix' });
      buildCertificationResultForLearner(1, Frameworks.CORE, 10, new Date());
      buildCertificationResultForLearner(2, Frameworks.CORE, null, new Date());
      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultForCsvRepository.findMostRecentByLearners({
        learnerIds: [20, 30],
      });

      // then
      expect(certificationResults).to.deep.equal([]);
    });
  });
});

function buildCertificationResultForSessionAndResultRecipient(
  certificationCourseId: number,
  framework: Framework,
  sessionId: number,
  resultRecipientEmail: string,
) {
  return buildCertificationResult(certificationCourseId, framework, sessionId, resultRecipientEmail, null, new Date());
}

function buildCertificationResultForLearner(
  certificationCourseId: number,
  framework: Framework,
  learnerId: number | null,
  startedAt: Date,
) {
  const sessionId = databaseBuilder.factory.buildSession().id;
  return buildCertificationResult(certificationCourseId, framework, sessionId, 'foo@example.net', learnerId, startedAt);
}

function buildCertificationResult(
  certificationCourseId: number,
  framework: Framework,
  sessionId: number,
  resultRecipientEmail: string,
  learnerId: number | null,
  startedAt: Date,
) {
  let pixScore: number | null = null;
  let competenceMarks: Array<{ level: number; competenceCode: string }> | null = null;
  let competenceMarksForDBResult: Array<{ level: number; competenceId: string }> | null = null;
  let hasAcquiredClea: boolean | null = null;
  if (framework === Frameworks.CORE || framework === Frameworks.CLEA) {
    pixScore = 678;
    competenceMarks = [
      {
        level: 1,
        competenceCode: '1.1',
      },
      {
        level: 7,
        competenceCode: '2.2',
      },
    ];
    competenceMarksForDBResult = [
      {
        level: 1,
        competenceId: 'competenceABC123',
      },
      {
        level: 7,
        competenceId: 'competenceDEF456',
      },
    ];
  }
  if (framework === Frameworks.CLEA) {
    hasAcquiredClea = true;
  }
  const data = {
    certificationId: certificationCourseId,
    firstName: `firstName ${certificationCourseId}`,
    lastName: `lastName ${certificationCourseId}`,
    birthdate: '1990-01-01',
    birthplace: `birthplace ${certificationCourseId}`,
    externalId: `externalId ${certificationCourseId}`,
    framework,
    status: CERTIFICATION_RESULT_STATUSES.REJECTED,
    reachedMeshIndex: 1,
    pixScore,
    competenceMarks,
    hasAcquiredClea,
    commentForOrganization: `commentForOrganization ${certificationCourseId}`,
    commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_ZERO_PIX_SCORE,
    certificationCenter: `certificationCenter ${certificationCourseId}`,
    startedAt,
    sessionId,
  };
  const userId = databaseBuilder.factory.buildUser().id;
  const candidateId = databaseBuilder.factory.buildCertificationCandidate({
    sessionId,
    userId,
    resultRecipientEmail,
  }).id;
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationCourseId,
    sessionId,
    userId,
    candidateId,
  });
  const certificationResultId = databaseBuilder.factory.buildCertificationResult({
    id: `20000002-2002-2002-2002-20000000000${certificationCourseId}`,
    firstName: data.firstName,
    lastName: data.lastName,
    birthdate: data.birthdate,
    birthplace: data.birthplace,
    externalId: data.externalId,
    framework: data.framework,
    status: data.status,
    reachedMeshIndex: data.reachedMeshIndex,
    pixScore: data.pixScore,
    competenceMarks: competenceMarksForDBResult,
    hasAcquiredClea: data.hasAcquiredClea,
    commentForOrganization: data.commentForOrganization,
    commentByAutoJury: data.commentByAutoJury,
    certificationCenter: data.certificationCenter,
    startedAt: data.startedAt,
  }).id;
  databaseBuilder.factory.buildUserCertificationResult({
    userId,
    sessionId,
    certificationCourseId,
    certificationResultId,
    organizationLearnerId: learnerId,
  });
  return data;
}
