import { expect } from 'chai';
import sinon from 'sinon';

import { FixNotNullScorePixCancelledOrRejectedV3AssessmentResultsScript } from '../../../../src/certification/scripts/fix-not-null-score-pix-cancelled-or-rejected-v3-assessment-results.js';
import { AlgorithmEngineVersion } from '../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { AssessmentResult } from '../../../../src/shared/domain/models/AssessmentResult.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('Integration | Scripts | FixNotNullScorePixCancelledOrRejectedV3AssessmentResultsScript', function () {
  let script;
  let logger;

  beforeEach(function () {
    script = new FixNotNullScorePixCancelledOrRejectedV3AssessmentResultsScript();
    logger = { info: sinon.stub(), warn: sinon.stub(), error: sinon.stub() };
  });

  function buildV3AssessmentResult({ status, pixScore }) {
    const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
      version: AlgorithmEngineVersion.V3,
    }).id;
    return databaseBuilder.factory.buildAssessmentResult({ certificationCourseId, status, pixScore }).id;
  }

  function buildV2AssessmentResult({ status, pixScore }) {
    const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
      version: AlgorithmEngineVersion.V2,
    }).id;
    return databaseBuilder.factory.buildAssessmentResult({ certificationCourseId, status, pixScore }).id;
  }

  describe('#handle', function () {
    context('dryRun: false', function () {
      it('sets pixScore to null for a cancelled v3 assessment result', async function () {
        const id = buildV3AssessmentResult({ status: AssessmentResult.status.CANCELLED, pixScore: 42 });
        await databaseBuilder.commit();

        await script.handle({ options: { dryRun: false, throttleDelay: 5, startId: id - 10, chunkSize: 5 }, logger });

        const row = await knex('assessment-results').where({ id }).first();
        expect(row.pixScore).to.be.null;
      });

      it('sets pixScore to null for a cancelled v3 assessment result with pixScore 0', async function () {
        const id = buildV3AssessmentResult({ status: AssessmentResult.status.CANCELLED, pixScore: 0 });
        await databaseBuilder.commit();

        await script.handle({ options: { dryRun: false, throttleDelay: 5, startId: id - 10, chunkSize: 5 }, logger });

        const row = await knex('assessment-results').where({ id }).first();
        expect(row.pixScore).to.be.null;
      });

      it('sets pixScore to null for a rejected v3 assessment result with a non-zero score', async function () {
        const id = buildV3AssessmentResult({ status: AssessmentResult.status.REJECTED, pixScore: 10 });
        await databaseBuilder.commit();

        await script.handle({ options: { dryRun: false, throttleDelay: 5, startId: id - 10, chunkSize: 5 }, logger });

        const row = await knex('assessment-results').where({ id }).first();
        expect(row.pixScore).to.be.null;
      });

      it('does not touch a rejected v3 assessment result with pixScore 0', async function () {
        const id = buildV3AssessmentResult({ status: AssessmentResult.status.REJECTED, pixScore: 0 });
        await databaseBuilder.commit();

        await script.handle({ options: { dryRun: false, throttleDelay: 5, startId: id - 10, chunkSize: 5 }, logger });

        const row = await knex('assessment-results').where({ id }).first();
        expect(row.pixScore).to.equal(0);
      });

      it('does not touch a validated v3 assessment result', async function () {
        const id = buildV3AssessmentResult({ status: AssessmentResult.status.VALIDATED, pixScore: 50 });
        await databaseBuilder.commit();

        await script.handle({ options: { dryRun: false, throttleDelay: 5, startId: id - 10, chunkSize: 5 }, logger });

        const row = await knex('assessment-results').where({ id }).first();
        expect(row.pixScore).to.equal(50);
      });

      it('does not touch a cancelled v2 assessment result', async function () {
        const id = buildV2AssessmentResult({ status: AssessmentResult.status.CANCELLED, pixScore: 30 });
        await databaseBuilder.commit();

        await script.handle({ options: { dryRun: false, throttleDelay: 5, startId: id - 10, chunkSize: 5 }, logger });

        const row = await knex('assessment-results').where({ id }).first();
        expect(row.pixScore).to.equal(30);
      });
    });

    context('dryRun: true', function () {
      it('does not update any row', async function () {
        const id = buildV3AssessmentResult({ status: AssessmentResult.status.CANCELLED, pixScore: 42 });
        await databaseBuilder.commit();

        await script.handle({ options: { dryRun: true, throttleDelay: 5, startId: id - 10, chunkSize: 5 }, logger });

        const row = await knex('assessment-results').where({ id }).first();
        expect(row.pixScore).to.equal(42);
      });
    });
  });
});
