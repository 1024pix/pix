import { KnexTimeoutError } from 'knex/lib/util/timeout.js';

import * as selectNextCertificationChallengeApi from '../../../../../../src/certification/evaluation/application/api/select-next-certification-challenge-api.js';
import { usecases } from '../../../../../../src/certification/evaluation/domain/usecases/index.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Assessment, CertificationIssueReportCategory } from '../../../../../../src/shared/domain/models/index.js';
import { FRENCH_FRANCE } from '../../../../../../src/shared/domain/services/locale-service.js';
import { catchErr, databaseBuilder, expect, knex, sinon } from '../../../../../test-helper.js';

describe('Integration | Application | Certification | Evaluation | API', function () {
  describe('#selectNextCertificationChallenge', function () {
    it('should lock assessment during challenge selection', async function () {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
        id: 99,
      });
      const session = databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenter.id });
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id,
        version: AlgorithmEngineVersion.V3,
      });
      databaseBuilder.factory.buildCertificationCandidate({
        userId: certificationCourse.userId,
        sessionId: session.id,
        accessibilityAdjustmentNeeded: false,
      });
      databaseBuilder.factory.buildCertificationIssueReport({
        certificationCourseId: certificationCourse.id,
        category: CertificationIssueReportCategory.OTHER,
        description: "il s'est enfuit de la session",
      });

      const originalAssessment = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourse.id,
        type: Assessment.types.CERTIFICATION,
      });

      databaseBuilder.factory.buildFlashAlgorithmConfiguration();
      await databaseBuilder.commit();

      // The usecase is called after the lock is placed by the api
      const usecaseCalledAfterTheLock = sinon.stub(usecases, 'getNextChallenge');

      usecaseCalledAfterTheLock.callsFake(async () => {
        // Now that the repositoryThatLocksTheAssessment has been called, the assessment is locked
        // In the middle of the selectNextCertificationChallenge transaction, lock is not available
        // Any attempt to concurrently lock will timeout
        // @see {https://github.com/knex/knex/blob/b6507a7129d2b9fafebf5f831494431e64c6a8a0/test/integration2/query/select/selects.spec.js#L953}
        await knex('assessments').where({ id: originalAssessment.id }).forUpdate().first().timeout(100);
      });

      // when
      const timeoutError = await catchErr(selectNextCertificationChallengeApi.selectNextCertificationChallenge)({
        assessmentId: originalAssessment.id,
        locale: FRENCH_FRANCE,
      });

      // then
      // During the transaction our stub tried to lock the same assemment
      expect(usecaseCalledAfterTheLock).to.have.been.calledOnce;
      // Since the locked was taken by selectNextCertificationChallenge, the timeout occured
      expect(timeoutError).to.be.an.instanceOf(KnexTimeoutError);
      expect(timeoutError.message).to.equal('Defined query timeout of 100ms exceeded when running query.');
      // Not that we are out of the transaction the lock is available
      const assessmentAfterLock = await knex('assessments')
        .where({ id: originalAssessment.id })
        .forUpdate()
        .first()
        .timeout(100);
      return expect(assessmentAfterLock.id).to.equal(originalAssessment.id);
    });
  });
});
