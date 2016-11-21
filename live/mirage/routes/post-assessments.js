import _                  from 'lodash/lodash';

import rawAssessment from '../data/assessments/raw-assessment';
import refAssessment from '../data/assessments/ref-assessment';

export default function (schema, request) {

  const answer = JSON.parse(request.requestBody);
  const courseId = answer.data.relationships.course.data.id;

  const allAssessments = [
    rawAssessment,
    refAssessment
  ];

  const assessments = _.map(allAssessments, function(oneAssessment) {
    return {id: oneAssessment.data.relationships.course.data.id, obj: oneAssessment}
  });

  const assessment = _.find(assessments, {id:courseId});

  if (assessment) {
    return assessment.obj;
  } else {
    throw new Error('undefined new assessment, sorry');
  }


}
