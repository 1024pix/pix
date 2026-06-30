import sinon from 'sinon';

import { FixValidatedV3AssessmentResultsWithZeroScoreScript } from '../../../scripts/certification/fix-validated-v3-assessment-results-with-zero-score.js';
import { AlgorithmEngineVersion } from '../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../src/certification/shared/domain/models/Frameworks.js';
import { AutoJuryCommentKeys } from '../../../src/certification/shared/domain/models/JuryComment.js';
import { Assessment } from '../../../src/shared/domain/models/Assessment.js';
import { AssessmentResult } from '../../../src/shared/domain/models/AssessmentResult.js';
import { expect } from '../../test-helper.js';
import { databaseBuilder, knex } from '../../tooling/databases.js';
import { catchErr } from '../../tooling/test-utils/error.js';

describe('Integration | Scripts | Certification | fix-validated-v3-assessment-results-with-zero-score', function () {
  let script;
  let logger;

  beforeEach(function () {
    script = new FixValidatedV3AssessmentResultsWithZeroScoreScript();
    logger = { info: sinon.stub(), error: sinon.stub() };
  });

  function buildCertificationAssessmentResult({ version, pixScore, status, framework = Frameworks.CORE }) {
    const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ version, framework }).id;
    const assessmentId = databaseBuilder.factory.buildAssessment({
      certificationCourseId,
      type: Assessment.types.CERTIFICATION,
    }).id;
    return databaseBuilder.factory.buildAssessmentResult({ assessmentId, pixScore, status }).id;
  }

  async function getAssessmentResult(id) {
    return knex('assessment-results').where({ id }).first();
  }

  describe('#handle', function () {
    context('when dryRun is false', function () {
      it('updates only the v3 validated assessment-results with a pixScore of 0 to "rejected"', async function () {
        // given
        const targetId = buildCertificationAssessmentResult({
          version: AlgorithmEngineVersion.V3,
          pixScore: 0,
          status: AssessmentResult.status.VALIDATED,
        });
        const v3WithPositiveScoreId = buildCertificationAssessmentResult({
          version: AlgorithmEngineVersion.V3,
          pixScore: 10,
          status: AssessmentResult.status.VALIDATED,
        });
        const v2WithZeroScoreId = buildCertificationAssessmentResult({
          version: AlgorithmEngineVersion.V2,
          pixScore: 0,
          status: AssessmentResult.status.VALIDATED,
        });
        const alreadyRejectedId = buildCertificationAssessmentResult({
          version: AlgorithmEngineVersion.V3,
          pixScore: 0,
          status: AssessmentResult.status.REJECTED,
        });
        const v3NonCoreWithoutScoreId = buildCertificationAssessmentResult({
          version: AlgorithmEngineVersion.V3,
          framework: Frameworks.DROIT,
          pixScore: null,
          status: AssessmentResult.status.VALIDATED,
        });
        await databaseBuilder.commit();

        // when
        await script.handle({ logger, options: { dryRun: false } });

        // then
        const targetToReject = await getAssessmentResult(targetId);
        expect(targetToReject.status).to.equal(AssessmentResult.status.REJECTED);
        expect(targetToReject.commentByAutoJury).to.equal(AutoJuryCommentKeys.REJECTED_DUE_TO_ZERO_PIX_SCORE);

        const v3WithPositiveScore = await getAssessmentResult(v3WithPositiveScoreId);
        expect(v3WithPositiveScore.status).to.equal(AssessmentResult.status.VALIDATED);
        expect(v3WithPositiveScore.commentByAutoJury).to.be.null;

        expect((await getAssessmentResult(v2WithZeroScoreId)).status).to.equal(AssessmentResult.status.VALIDATED);
        expect((await getAssessmentResult(alreadyRejectedId)).status).to.equal(AssessmentResult.status.REJECTED);
        expect((await getAssessmentResult(v3NonCoreWithoutScoreId)).status).to.equal(AssessmentResult.status.VALIDATED);
        expect(logger.info).to.have.been.calledWith(
          'Script finished. 1 assessment-results updated from "validated" to "rejected".',
        );
      });
    });

    context('when dryRun is true', function () {
      it('does not persist any change', async function () {
        // given
        const targetId = buildCertificationAssessmentResult({
          version: AlgorithmEngineVersion.V3,
          pixScore: 0,
          status: AssessmentResult.status.VALIDATED,
        });
        await databaseBuilder.commit();

        // when
        await script.handle({ logger, options: { dryRun: true } });

        // then
        const assessmentResult = await getAssessmentResult(targetId);
        expect(assessmentResult.status).to.equal(AssessmentResult.status.VALIDATED);

        expect(logger.info).to.have.been.calledWith(
          '[DRY RUN] 1 assessment-results would have been updated to "rejected".',
        );
      });
    });

    context('when an error occurs while fixing the results', function () {
      it('rolls back the changes and rethrows the error', async function () {
        // given
        const targetId = buildCertificationAssessmentResult({
          version: AlgorithmEngineVersion.V3,
          pixScore: 0,
          status: AssessmentResult.status.VALIDATED,
        });
        await databaseBuilder.commit();

        const beginTransaction = knex.transaction.bind(knex);
        sinon.stub(knex, 'transaction').callsFake(async () => {
          const trx = await beginTransaction();
          trx.commit = () => Promise.reject(new Error('BOOM'));
          return trx;
        });

        // when
        const error = await catchErr(script.handle, script)({ logger, options: { dryRun: false } });

        // then
        expect(error.message).to.equal('BOOM');

        const assessmentResult = await getAssessmentResult(targetId);
        expect(assessmentResult.status).to.equal(AssessmentResult.status.VALIDATED);
      });
    });
  });
});
