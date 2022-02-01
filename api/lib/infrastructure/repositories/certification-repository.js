const CertificationCourseBookshelf = require('../orm-models/CertificationCourse');
const Bookshelf = require('../bookshelf');
const { CertificationCourseNotPublishableError } = require('../../../lib/domain/errors');

async function getAssessmentResultsStatusesBySessionId(id) {
  const collection = await CertificationCourseBookshelf.query((qb) => {
    qb.innerJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id');
    qb.innerJoin(
      Bookshelf.knex.raw(
        `"assessment-results" ar ON ar."assessmentId" = "assessments".id
                    and ar."createdAt" = (select max(sar."createdAt") from "assessment-results" sar where sar."assessmentId" = "assessments".id)`
      )
    );
    qb.where({ 'certification-courses.sessionId': id });
  }).fetchAll({ columns: ['status'] });

  return collection.map((obj) => obj.attributes.status);
}

module.exports = {
  async publishCertificationCoursesBySessionId(sessionId) {
    const statuses = await getAssessmentResultsStatusesBySessionId(sessionId);
    if (statuses.includes('error') || statuses.includes('started')) {
      throw new CertificationCourseNotPublishableError();
    }
    await CertificationCourseBookshelf.where({ sessionId }).save(
      { isPublished: true },
      { method: 'update', require: false }
    );
  },

  async unpublishCertificationCoursesBySessionId(sessionId) {
    await CertificationCourseBookshelf.where({ sessionId }).save({ isPublished: false }, { method: 'update' });
  },
};
