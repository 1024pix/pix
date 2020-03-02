const { expect, knex, databaseBuilder } = require('../../test-helper');

const { updateResultsSentToPrescribedDate } = require('../../../scripts/20200219_pa_146_update_results_sent_to_prescriber_at');

describe('Acceptance | Scripts | 20200219_pa_146_update_results_sent_to_prescriber_at_test.js', () => {
  let sessionWithoutCourse;
  let sessionWithAllPublishedCourses;
  let sessionWithNonePublishedCourses;
  let sessionWithoutAllPublishedCourses;
  let sessionWithAllPublishedCoursesAndDefinedResultsSentToPrescriberAt;

  beforeEach(async () => {
    // given
    sessionWithoutCourse = _createSession();

    sessionWithAllPublishedCourses = _createSession();
    _createPublishedCertificationCourses(sessionWithAllPublishedCourses);

    sessionWithoutAllPublishedCourses = _createSession();
    _createPublishedCertificationCourses(sessionWithoutAllPublishedCourses);
    _createUnpublishedCertificationCourses(sessionWithoutAllPublishedCourses);
    sessionWithNonePublishedCourses = _createSession();
    _createUnpublishedCertificationCourses(sessionWithNonePublishedCourses);

    sessionWithAllPublishedCoursesAndDefinedResultsSentToPrescriberAt = _createSession({ resultsSentToPrescriberAt: new Date() });
    _createPublishedCertificationCourses(sessionWithAllPublishedCoursesAndDefinedResultsSentToPrescriberAt);

    await databaseBuilder.commit();
  });

  describe('Session without certification course', () => {

    it('does not set resultsSentToPrescriberAt value', async () => {
      // when
      await updateResultsSentToPrescribedDate();
      // then
      const [sessionAfterUpdate] = await knex('sessions').where({ id: sessionWithoutCourse.id });
      expect(sessionAfterUpdate.resultsSentToPrescriberAt).to.be.null;
    });
  });

  describe('Session with certification courses', () => {
    context('all published', () => {
      it('does set resultsSentToPrescriberAt value', async () => {
        // when
        await updateResultsSentToPrescribedDate();
        // then
        const [sessionAfterUpdate] = await knex('sessions').where({ id: sessionWithAllPublishedCourses.id });
        expect(sessionAfterUpdate.resultsSentToPrescriberAt).not.to.be.null;
      });

      it('does not update resultsSentToPrescriberAt value', async () => {
        // when
        await updateResultsSentToPrescribedDate();
        // then
        const [sessionAfterUpdate] = await knex('sessions').where({ id: sessionWithAllPublishedCoursesAndDefinedResultsSentToPrescriberAt.id });
        expect(sessionAfterUpdate.resultsSentToPrescriberAt.toString())
          .to.equal(sessionWithAllPublishedCoursesAndDefinedResultsSentToPrescriberAt.resultsSentToPrescriberAt.toString());
      });
    });

    context('not all published', () => {
      it('does set resultsSentToPrescriberAt value (considered published)', async () => {
        // when
        await updateResultsSentToPrescribedDate();
        // then
        const [sessionAfterUpdate] = await knex('sessions').where({ id: sessionWithoutAllPublishedCourses.id });
        expect(sessionAfterUpdate.resultsSentToPrescriberAt).not.to.be.null;
      });
    });

    context('none published', () => {
      it('does not set resultsSentToPrescriberAt value', async () => {
        // when
        await updateResultsSentToPrescribedDate();
        // then
        const [sessionAfterUpdate] = await knex('sessions').where({ id: sessionWithNonePublishedCourses.id });
        expect(sessionAfterUpdate.resultsSentToPrescriberAt).to.be.null;
      });
    });
  });
});

function _createSession(session) {
  return databaseBuilder.factory.buildSession(session);
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
