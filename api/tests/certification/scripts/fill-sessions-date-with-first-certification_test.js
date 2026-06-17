import sinon from 'sinon';

import { FillSessionsDateWithFirstCertification } from '../../../scripts/certification/fill-sessions-date-with-first-certification.js';
import { expect } from '../../test-helper.js';
import { databaseBuilder, knex } from '../../tooling/databases.js';
import { catchErr } from '../../tooling/test-utils/error.js';

describe('Certification | Scripts | FillSessionsDateWithFirstCertification', function () {
  let sessionWithoutCertification_id,
    sessionBefore29thMay1_id,
    sessionBefore29thMay2_id,
    sessionAfter29thMay_id,
    script,
    logger;
  beforeEach(function () {
    script = new FillSessionsDateWithFirstCertification();
    logger = {
      info: sinon.stub(),
      error: sinon.stub(),
    };

    sessionWithoutCertification_id = databaseBuilder.factory.buildSession({
      date: '2021-01-01',
    }).id;

    sessionBefore29thMay1_id = databaseBuilder.factory.buildSession({
      date: '2021-01-01',
    }).id;
    databaseBuilder.factory.buildCertificationCourse({
      createdAt: new Date('2022-02-02'),
      sessionId: sessionBefore29thMay1_id,
    });

    sessionBefore29thMay2_id = databaseBuilder.factory.buildSession({
      date: '2030-01-01',
    }).id;
    databaseBuilder.factory.buildCertificationCourse({
      createdAt: new Date('2023-03-03'),
      sessionId: sessionBefore29thMay2_id,
    });

    sessionAfter29thMay_id = databaseBuilder.factory.buildSession({
      date: '2021-01-01',
    }).id;
    databaseBuilder.factory.buildCertificationCourse({
      createdAt: new Date('2026-05-30'),
      sessionId: sessionAfter29thMay_id,
    });

    return databaseBuilder.commit();
  });

  context('dryRun ON', function () {
    it('does not persist the changes', async function () {
      await script.handle({
        logger,
        options: { dryRun: true, throttleDelay: 5, chunkSize: 2, startId: sessionWithoutCertification_id - 1 },
      });

      const sessionDateValues = await knex
        .pluck('date')
        .from('sessions')
        .whereIn('id', [
          sessionWithoutCertification_id,
          sessionBefore29thMay1_id,
          sessionBefore29thMay2_id,
          sessionAfter29thMay_id,
        ])
        .orderBy('id');
      expect(sessionDateValues).to.have.lengthOf(4);
      expect(sessionDateValues[0]).to.equal('2021-01-01');
      expect(sessionDateValues[1]).to.equal('2021-01-01');
      expect(sessionDateValues[2]).to.equal('2030-01-01');
      expect(sessionDateValues[3]).to.equal('2021-01-01');
      expect(logger.info).to.have.been.calledWith(
        `Script execution started with options {"dryRun":true,"throttleDelay":5,"chunkSize":2,"startId":${sessionWithoutCertification_id - 1}}`,
      );
      expect(logger.info).to.have.been.calledWith('Script finished. Number of sessions processed : 2, youpi');
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
            startId: sessionWithoutCertification_id - 1,
          },
        });

        const sessionDateValues = await knex
          .pluck('date')
          .from('sessions')
          .whereIn('id', [
            sessionWithoutCertification_id,
            sessionBefore29thMay1_id,
            sessionBefore29thMay2_id,
            sessionAfter29thMay_id,
          ])
          .orderBy('id');
        expect(sessionDateValues).to.have.lengthOf(4);
        expect(sessionDateValues[0]).to.equal('2021-01-01');
        expect(sessionDateValues[1]).to.equal('2022-02-02');
        expect(sessionDateValues[2]).to.equal('2023-03-03');
        expect(sessionDateValues[3]).to.equal('2021-01-01');
        expect(logger.info).to.have.been.calledWith(
          `Script execution started with options {"dryRun":false,"throttleDelay":5,"chunkSize":2,"startId":${sessionWithoutCertification_id - 1}}`,
        );
        expect(logger.info).to.have.been.calledWith('Script finished. Number of sessions processed : 2, youpi');
        expect(logger.error).to.not.have.been.called;
      });
    });

    context('when an error occurs during the process', function () {
      it('persists only the batches before the error occurs', async function () {
        const sabotageHook = (queryData) => {
          if (queryData.bindings?.[0] === sessionBefore29thMay2_id && queryData.sql.startsWith('UPDATE')) {
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
            startId: sessionWithoutCertification_id - 1,
          },
        });

        expect(err.message).to.equal('SABOTAGING_TO_TRIGGER_ROLLBACK');
        const sessionDateValues = await knex
          .pluck('date')
          .from('sessions')
          .whereIn('id', [
            sessionWithoutCertification_id,
            sessionBefore29thMay1_id,
            sessionBefore29thMay2_id,
            sessionAfter29thMay_id,
          ])
          .orderBy('id');
        expect(sessionDateValues).to.have.lengthOf(4);
        expect(sessionDateValues[0]).to.equal('2021-01-01');
        expect(sessionDateValues[1]).to.equal('2022-02-02');
        expect(sessionDateValues[2]).to.equal('2030-01-01');
        expect(sessionDateValues[3]).to.equal('2021-01-01');
        expect(logger.info).to.have.been.calledWith(
          `Script execution started with options {"dryRun":false,"throttleDelay":5,"chunkSize":1,"startId":${sessionWithoutCertification_id - 1}}`,
        );
        expect(logger.info).to.have.been.calledWith('Script interrupted. Number of sessions processed so far : 1');
        expect(logger.error).to.have.been.calledWithMatch('Error: SABOTAGING_TO_TRIGGER_ROLLBACK');
      });
    });
  });
});
