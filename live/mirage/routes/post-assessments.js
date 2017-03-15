import _ from 'pix-live/utils/lodash-custom';

import refAssessment from '../data/assessments/ref-assessment';

export default function (schema, request) {

  const answer = JSON.parse(request.requestBody);
  const courseId = answer.data.relationships.course.data.id;

  const allAssessments = [
    refAssessment
  ];

  const assessments = _.map(allAssessments, function (oneAssessment) {
    return { id: oneAssessment.data.relationships.course.data.id, obj: oneAssessment };
  });

  const assessment = _.find(assessments, { id: courseId });

  if (assessment) {
    return assessment.obj;
  } else if (_.startsWith(courseId, 'null')) {
    return refAssessment;
  } else {
    throw new Error('undefined new assessment, sorry');
  }

}
