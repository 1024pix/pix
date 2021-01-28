const groupBy = require('lodash/group-by');
const some = require('lodash/some');

module.exports = async function findSessionsForCertificationCenter({
  sessionRepository,
  certificationCoursesRepository,
}) {
  const finalizedSessions = sessionRepository.findFinalizedSessions();
  const finalizedSessionsWithoutGlobalComment = finalizedSessions.filter(
    (session) => !session.examinerGlobalComment,
  );

  const certificationCourses = certificationCoursesRepository.findBySessionIds(
    finalizedSessionsWithoutGlobalComment.map((session) => session.id),
  );
  const certificationCoursesBySession = groupBy(
    certificationCourses,
    (certificationCourse) => certificationCourse.sessionId,
  ).filter(
    (certificationCourses) => !some(
      certificationCourses,
      (certificationCourse) => certificationCourse.hasSeenEndTestScreen,
    ),
  );

  // aucun signalement impactant

  // for each session
  //   remove session with global comment
  //   for each certifCourses
  //     remove certif course with status "error" or "started"
  //     for each issueReport
  //     end
  //   end
  // end

  // OK aucun commentaire global OK
  // aucune certif course avec status "error" ou "started"
  // OK aucune certif courses avec case de fin non renseigné
};