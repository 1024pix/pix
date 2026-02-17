import { Response } from 'miragejs';

export default function (schema, request) {
  const requestedAssessment = JSON.parse(request.requestBody);
  let courseData = null;
  if (requestedAssessment.data.relationships) {
    courseData = requestedAssessment.data.relationships.course.data;
  }
  if (courseData && courseData.id.startsWith('rec')) {
    const course = schema.challenges.find(courseData.id);
    return schema.assessments.create({
      course,
      state: 'started',
      type: 'DEMO',
      hasCheckpoints: false,
      showChallengeStepper: true,
      showLevelup: false,
      showQuestionCounter: true,
      orderedChallengeIdsAnswered: [],
    });
  }

  return new Response(500);
}
