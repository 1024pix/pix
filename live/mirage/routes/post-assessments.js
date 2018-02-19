import _ from 'pix-live/utils/lodash-custom';

import refAssessment from '../data/assessments/ref-assessment';

export default function(schema, request) {

  const answer = JSON.parse(request.requestBody);
  const courseId = answer.data.relationships.course.data.id;

  const allAssessments = [
    refAssessment
  ];

  // TODO: clean legacy
  const assessments = _.map(allAssessments, function(oneAssessment) {
    return { id: oneAssessment.data.relationships.course.data.id, obj: oneAssessment };
  });

  const newAssessment = {
    'user-id': 'user_id',
    'user-name': 'Jane Doe',
    'user-email': 'jane@acme.com',
    'certification-number': 'certification-number',
  };

  const assessment = _.find(assessments, { id: courseId });
  if (assessment) {
    return assessment.obj;

  } else if (_.startsWith(courseId, 'null')) {
    return refAssessment;
  } else if (!_.startsWith(courseId, 'rec')) {
    newAssessment.type = 'CERTIFICATION';
    newAssessment.courseId = 'certification-number';
  }
  return schema.assessments.create(newAssessment);
}
