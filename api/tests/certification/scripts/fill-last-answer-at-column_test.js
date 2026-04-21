import sinon from 'sinon';

import { FillLastAnswerAtColumn } from '../../../scripts/certification/fill-last-answer-at-column.js';
import { databaseBuilder, knex } from '../../tooling/databases.js';
import { catchErr } from '../../tooling/test-utils/error.js';

describe('Certification | Scripts | fill lastAnswerAt column', function () {
  let certificationCourseWithoutAssessmentId,
    certificationCourseWithoutAnswerId,
    certificationCourseWithAnswers1Id,
    certificationCourseWithAnswers2Id,
    script;
  let logger;
  beforeEach(function () {
    script = new FillLastAnswerAtColumn();
    logger = {
      info: sinon.stub(),
      error: sinon.stub(),
    };

    certificationCourseWithoutAssessmentId = databaseBuilder.factory.buildCertificationCourse({
      lastAnswerAt: null,
    }).id;

    certificationCourseWithAnswers1Id = databaseBuilder.factory.buildCertificationCourse({
      lastAnswerAt: null,
    }).id;
    let assessmentId = databaseBuilder.factory.buildAssessment({
      certificationCourseId: certificationCourseWithAnswers1Id,
    }).id;
    databaseBuilder.factory.buildAnswer({ assessmentId, createdAt: new Date('2024-01-01') });
    databaseBuilder.factory.buildAnswer({ assessmentId, createdAt: new Date('2025-01-01') });
    databaseBuilder.factory.buildAnswer({ assessmentId, createdAt: new Date('2023-01-01') });

    certificationCourseWithoutAnswerId = databaseBuilder.factory.buildCertificationCourse({
      lastAnswerAt: null,
    }).id;
    databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationCourseWithoutAnswerId });

    certificationCourseWithAnswers2Id = databaseBuilder.factory.buildCertificationCourse({
      lastAnswerAt: new Date('2022-12-25'),
    }).id;
    assessmentId = databaseBuilder.factory.buildAssessment({
      certificationCourseId: certificationCourseWithAnswers2Id,
    }).id;
    databaseBuilder.factory.buildAnswer({ assessmentId, createdAt: new Date('2024-05-05') });
    databaseBuilder.factory.buildAnswer({ assessmentId, createdAt: new Date('2025-05-05') });
    databaseBuilder.factory.buildAnswer({ assessmentId, createdAt: new Date('2023-05-05') });

    return databaseBuilder.commit();
  });

  context('dryRun ON', function () {
    it('does not persist the changes', async function () {
      await script.handle({
        logger,
        options: { dryRun: true, throttleDelay: 5, chunkSize: 2, startId: certificationCourseWithoutAssessmentId - 1 },
      });

      const lastAnswerAtValues = await knex
        .pluck('lastAnswerAt')
        .from('certification-courses')
        .whereIn('id', [
          certificationCourseWithoutAssessmentId,
          certificationCourseWithoutAnswerId,
          certificationCourseWithAnswers1Id,
          certificationCourseWithAnswers2Id,
        ])
        .orderBy('id');
      expect(lastAnswerAtValues).to.have.lengthOf(4);
      expect(lastAnswerAtValues[0]).to.be.null;
      expect(lastAnswerAtValues[1]).to.be.null;
      expect(lastAnswerAtValues[2]).to.be.null;
      expect(lastAnswerAtValues[3]).to.deep.equal(new Date('2022-12-25'));
      expect(logger.info).to.have.been.calledWith(
        `Script execution started with options {"dryRun":true,"throttleDelay":5,"chunkSize":2,"startId":${certificationCourseWithoutAssessmentId - 1}}`,
      );
      expect(logger.info).to.have.been.calledWith('Script finished. Number of certifications processed : 2, youpi');
      expect(logger.error).to.not.have.been.called;
    });
  });

  context('dryRun OFF', function () {
    context('when there are no errors', function () {
      it('persists all the changes', async function () {
        await script.handle({
          logger,
          options: {
            dryRun: false,
            throttleDelay: 5,
            chunkSize: 2,
            startId: certificationCourseWithoutAssessmentId - 1,
          },
        });

        const lastAnswerAtValues = await knex
          .pluck('lastAnswerAt')
          .from('certification-courses')
          .whereIn('id', [
            certificationCourseWithoutAssessmentId,
            certificationCourseWithoutAnswerId,
            certificationCourseWithAnswers1Id,
            certificationCourseWithAnswers2Id,
          ])
          .orderBy('id');
        expect(lastAnswerAtValues).to.have.lengthOf(4);
        expect(lastAnswerAtValues[0]).to.be.null;
        expect(lastAnswerAtValues[1]).to.deep.equal(new Date('2025-01-01'));
        expect(lastAnswerAtValues[2]).to.be.null;
        expect(lastAnswerAtValues[3]).to.deep.equal(new Date('2025-05-05'));
        expect(logger.info).to.have.been.calledWith(
          `Script execution started with options {"dryRun":false,"throttleDelay":5,"chunkSize":2,"startId":${certificationCourseWithoutAssessmentId - 1}}`,
        );
        expect(logger.info).to.have.been.calledWith('Script finished. Number of certifications processed : 2, youpi');
        expect(logger.error).to.not.have.been.called;
      });
    });

    context('when an error occurs during the process', function () {
      it('persists only the batches before the error occurs', async function () {
        const sabotageHook = (queryData) => {
          if (
            queryData.bindings?.[0] === certificationCourseWithAnswers2Id &&
            queryData.bindings?.[1] instanceof Date
          ) {
            throw new Error('SABOTAGING_TO_TRIGGER_ROLLBACK');
          } else {
            knex.once('query', sabotageHook);
          }
        };
        knex.once('query', sabotageHook);

        const err = await catchErr(script.handle)({
          logger,
          options: {
            dryRun: false,
            throttleDelay: 5,
            chunkSize: 1,
            startId: certificationCourseWithoutAssessmentId - 1,
          },
        });

        expect(err.message).to.equal('SABOTAGING_TO_TRIGGER_ROLLBACK');
        const lastAnswerAtValues = await knex
          .pluck('lastAnswerAt')
          .from('certification-courses')
          .whereIn('id', [
            certificationCourseWithoutAssessmentId,
            certificationCourseWithoutAnswerId,
            certificationCourseWithAnswers1Id,
            certificationCourseWithAnswers2Id,
          ])
          .orderBy('id');
        expect(lastAnswerAtValues).to.have.lengthOf(4);
        expect(lastAnswerAtValues[0]).to.be.null;
        expect(lastAnswerAtValues[1]).to.deep.equal(new Date('2025-01-01'));
        expect(lastAnswerAtValues[2]).to.be.null;
        expect(lastAnswerAtValues[3]).to.deep.equal(new Date('2022-12-25')); // old date not updated
        expect(logger.info).to.have.been.calledWith(
          `Script execution started with options {"dryRun":false,"throttleDelay":5,"chunkSize":1,"startId":${certificationCourseWithoutAssessmentId - 1}}`,
        );
        expect(logger.info).to.have.been.calledWith(
          'Script interrupted. Number of certifications processed so far : 1',
        );
        expect(logger.error).to.have.been.calledWithMatch('Error: SABOTAGING_TO_TRIGGER_ROLLBACK');
      });
    });
  });
});
