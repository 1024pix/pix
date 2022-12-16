import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: [
    'nbChallenges',
    'examinerComment',
    'hasSeenEndTestScreen',
    'firstName',
    'lastName',
    'isEndTestScreenRemovalEnabled',
  ],
  links(certificationCourse) {
    return {
      assessment: {
        related: `/api/assessments/${certificationCourse.assessmentId}`,
      },
    };
  },
});
