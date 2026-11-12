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
      const expectedResultData1 = buildCertificationResult(1, Frameworks.CORE, sessionId, resultRecipientEmail);
      buildCertificationResult(2, Frameworks.CORE, anotherSessionId, resultRecipientEmail); // noise
      buildCertificationResult(3, Frameworks.CORE, sessionId, 'someoneelse@example.net'); // noise
      const expectedResultData2 = buildCertificationResult(4, Frameworks.CLEA, sessionId, resultRecipientEmail);
      const expectedResultData3 = buildCertificationResult(5, Frameworks.DROIT, sessionId, resultRecipientEmail);
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
      buildCertificationResult(2, Frameworks.CORE, anotherSessionId, resultRecipientEmail);
      buildCertificationResult(3, Frameworks.CORE, sessionId, 'someoneelse@example.net');
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
});

function buildCertificationResult(
  certificationCourseId: number,
  framework: Framework,
  sessionId: number,
  resultRecipientEmail: string,
) {
  let pixScore = null,
    competenceMarks = null,
    competenceMarksForDBResult = null,
    hasAcquiredClea = null;
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
    startedAt: new Date(),
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
  });
  return data;
}
