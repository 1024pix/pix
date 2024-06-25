import { AssessmentResultJuryComment } from '../../../../../../src/certification/session-management/domain/models/AssessmentResultJuryComment.js';

const buildAssessmentResultJuryComment = function ({ id = 123, juryId = 5, commentByJury = 'comment' } = {}) {
  return new AssessmentResultJuryComment({
    id,
    juryId,
    commentByJury,
  });
};

export { buildAssessmentResultJuryComment };
