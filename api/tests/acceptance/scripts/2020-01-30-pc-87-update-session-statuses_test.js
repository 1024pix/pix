const { expect, knex, databaseBuilder } = require('../../test-helper');
const { range } = require('lodash');

const { updateSessionStatuses } = require('../../../scripts/2020-01-30-pc-87-update-session-statuses');

describe('Acceptance | Scripts | 2020-01-30-pc-87-update-session-statuses.js', () => {
  let sessionWithoutCourse;
  let startedSessionWithAllPublishedCourses;
  let finalizedSessionWithAllPublishedCourses;
  let sessionWithoutReport;
  let sessionIdsWithReport;
  let sessionWithReportFirst;
  let sessionWithReportSecond;

  beforeEach(async () => {
    // given
    sessionWithoutCourse = _createSessionWithStatus('started');

    startedSessionWithAllPublishedCourses = _createSessionWithStatus('started');
    _createPublishedCertificationCourses(startedSessionWithAllPublishedCourses);

    finalizedSessionWithAllPublishedCourses = _createSessionWithStatus('finalized');
    _createPublishedCertificationCourses(finalizedSessionWithAllPublishedCourses);

    sessionWithoutReport = _createSessionWithStatus('started');
    _createUnpublishedCertificationCourses(sessionWithoutReport);

    sessionWithReportFirst = _createSessionWithStatus('started');
    _createUnpublishedCertificationCourses(sessionWithoutReport);
    sessionWithReportSecond = _createSessionWithStatus('started');
    _createUnpublishedCertificationCourses(sessionWithoutReport);

    sessionIdsWithReport = [sessionWithReportFirst.id, sessionWithReportSecond.id];

    await databaseBuilder.commit();
  });

  describe('Session without certification course', () =>{

    it('keeps the "started" session status', async () => {
      // when
      await updateSessionStatuses(sessionIdsWithReport);

      // then
      const [sessionAfterUpdate] = await knex('sessions').where({ id: sessionWithoutCourse.id });
      expect(sessionAfterUpdate.status).to.equal('started');
    });
  });

  describe('Session with certification courses', () => {

    describe('all certification courses are published', () => {

      it('updates sessions status to "finalized"', async () => {
        // when
        await updateSessionStatuses(sessionIdsWithReport);

        // then
        const sessionsAfterUpdate = await knex('sessions')
          .whereIn('id', [
            startedSessionWithAllPublishedCourses.id,
            finalizedSessionWithAllPublishedCourses.id
          ]);

        sessionsAfterUpdate.forEach((session) => {
          expect(session.status).to.equal('finalized');
        });
        expect(sessionsAfterUpdate.length).to.equal(2);
      });

      it('saves the finalization date', async () => {
        // given
        const finalizationDatetime = new Date();

        // when
        await updateSessionStatuses(sessionIdsWithReport, finalizationDatetime);

        // then
        const [sessionAfterUpdate] = await knex('sessions').where({ id: startedSessionWithAllPublishedCourses.id });

        expect(sessionAfterUpdate.finalizedAt).to.deep.equal(finalizationDatetime);
      });
    });

    describe('all certification courses are not published', () => {

      describe('session report (PV de session) is received', () => {

        it('updates sessions status to "finalized"', async () => {
          // when
          await updateSessionStatuses(sessionIdsWithReport);

          // then
          const [sessionAfterUpdate] = await knex('sessions').where({ id: sessionWithReportFirst.id });

          expect(sessionAfterUpdate.status).to.equal('finalized');
        });
      });

      describe('session report (PV de session) is not received', () => {

        it('keeps the "started" session status', async () => {
          // when
          await updateSessionStatuses(sessionIdsWithReport);

          // then
          const [sessionAfterUpdate] = await knex('sessions').where({ id: sessionWithoutReport.id });

          expect(sessionAfterUpdate.status).to.equal('started');
        });
      });
    });
  });

  describe('when there is more than 3000 session reports (PV de session)', () => {

    it('runs without error', async () => {
      await updateSessionStatuses(range(1, 3000));
    });
  });
});

function _createSessionWithStatus(status) {
  return databaseBuilder.factory.buildSession({
    status,
  });
}

function _createPublishedCertificationCourses(session) {
  databaseBuilder.factory.buildCertificationCourse({
    sessionId: session.id,
    isPublished: true,
  });

  databaseBuilder.factory.buildCertificationCourse({
    sessionId: session.id,
    isPublished: true,
  });
}

function _createUnpublishedCertificationCourses(session) {
  databaseBuilder.factory.buildCertificationCourse({
    sessionId: session.id,
    isPublished: false,
  });

  databaseBuilder.factory.buildCertificationCourse({
    sessionId: session.id,
    isPublished: false,
  });
}
