import sinon from 'sinon';

import { FillEduV3NotEligibleAutoComment } from '../../../scripts/certification/fill-edu-v3-not-eligible-auto-comment.js';
import { AutoJuryCommentKeys } from '../../../src/certification/shared/domain/models/JuryComment.js';
import { SCOPES } from '../../../src/certification/shared/domain/models/Scopes.js';
import { AssessmentResult } from '../../../src/shared/domain/models/AssessmentResult.js';
import { databaseBuilder, knex } from '../../tooling/databases.js';
import { catchErr } from '../../tooling/test-utils/error.js';

describe('Certification | Scripts | fill edu v3 not eligible auto comment', function () {
  let assessmentResultToBeFilled, eduVersion, script;
  let logger;

  beforeEach(function () {
    script = new FillEduV3NotEligibleAutoComment();
    logger = {
      info: sinon.stub(),
      error: sinon.stub(),
    };

    eduVersion = databaseBuilder.factory.buildCertificationVersion({
      scope: SCOPES.PIX_PLUS_EDU_CPE,
    });

    assessmentResultToBeFilled = databaseBuilder.factory.buildAssessmentResult({
      versionId: eduVersion.id,
      status: AssessmentResult.status.REJECTED,
      reachedMeshIndex: null,
      commentByAutoJury: null,
    }).id;

    // Validated AssessmentResult
    databaseBuilder.factory.buildAssessmentResult({
      versionId: eduVersion.id,
      status: AssessmentResult.status.VALIDATED,
      reachedMeshIndex: 0,
      commentByAutoJury: null,
    }).id;

    // Rejected AssessmentResult with already an auto-comment
    databaseBuilder.factory.buildAssessmentResult({
      versionId: eduVersion.id,
      status: AssessmentResult.status.REJECTED,
      reachedMeshIndex: null,
      commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
    }).id;

    // Rejected AssessmentResult from a non-EDU version
    const version = databaseBuilder.factory.buildCertificationVersion({
      scope: SCOPES.PIX_PLUS_DROIT,
    });
    databaseBuilder.factory.buildAssessmentResult({
      versionId: version.id,
      status: AssessmentResult.status.REJECTED,
      reachedMeshIndex: null,
      commentByAutoJury: null,
    }).id;

    return databaseBuilder.commit();
  });

  context('dryRun ON', function () {
    it('does not persist the changes', async function () {
      const rowsToFill = await knex('assessment-results').pluck('id').whereIn('versionId', [eduVersion.id]).where({
        status: AssessmentResult.status.REJECTED,
        reachedMeshIndex: null,
        commentByAutoJury: null,
      });

      await script.handle({
        logger,
        options: { dryRun: true, versions: `${eduVersion.id}` },
      });

      const filledRows = await knex('assessment-results').whereIn('id', rowsToFill);

      expect(rowsToFill).to.have.lengthOf(1);
      expect(rowsToFill[0]).to.equal(assessmentResultToBeFilled);

      expect(filledRows).to.have.lengthOf(1);
      expect(filledRows[0].commentByAutoJury).to.be.null;

      expect(logger.info).to.have.been.calledWith(`Script execution started with versions: ${eduVersion.id}`);
      expect(logger.info).to.have.been.calledWith(
        `Number of Edu v3 assessment-results to be filled: ${filledRows.length}`,
      );
      expect(logger.info).to.have.been.calledWith(`${filledRows.length} would have been updated`);
      expect(logger.error).to.not.have.been.called;
    });
  });

  context('dryRun OFF', function () {
    context('when there are no errors', function () {
      it('persists all the changes', async function () {
        const rowsToFill = await knex('assessment-results').pluck('id').whereIn('versionId', [eduVersion.id]).where({
          status: AssessmentResult.status.REJECTED,
          reachedMeshIndex: null,
          commentByAutoJury: null,
        });

        await script.handle({
          logger,
          options: { dryRun: false, versions: `${eduVersion.id}` },
        });

        const filledRows = await knex('assessment-results').whereIn('id', rowsToFill);

        expect(filledRows).to.have.lengthOf(1);
        expect(filledRows[0].id).to.equal(assessmentResultToBeFilled);
        expect(filledRows[0].commentByAutoJury).to.equal(AutoJuryCommentKeys.REJECTED_EDU_NOT_ELIGIBLE);

        expect(logger.info).to.have.been.calledWith(`Script execution started with versions: ${eduVersion.id}`);
        expect(logger.info).to.have.been.calledWith(
          `Number of Edu v3 assessment-results to be filled: ${filledRows.length}`,
        );
        expect(logger.info).to.have.been.calledWith(`${filledRows.length} have been successfully updated`);
        expect(logger.error).to.not.have.been.called;
      });
    });

    context('when an error occurs during the process', function () {
      it('rolls back all changes', async function () {
        const sabotageHook = (queryData) => {
          if (queryData.method === 'update') {
            throw new Error('SABOTAGING_TO_TRIGGER_ROLLBACK');
          } else {
            knex.once('query', sabotageHook);
          }
        };
        knex.once('query', sabotageHook);

        const err = await catchErr(
          script.handle,
          script,
        )({
          logger,
          options: { dryRun: false, versions: `${eduVersion.id}` },
        });

        expect(err.message).to.equal('SABOTAGING_TO_TRIGGER_ROLLBACK');

        const unchangedRows = await knex('assessment-results').where({ id: assessmentResultToBeFilled });
        expect(unchangedRows[0].commentByAutoJury).to.be.null;
      });
    });
  });
});
