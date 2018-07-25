import _ from 'mon-pix/utils/lodash-custom';

import refAssessment from '../data/assessments/ref-assessment';

export default function(schema, request) {

  const requestedAssessment = JSON.parse(request.requestBody);

  const newAssessment = {
    'user-id': 'user_id',
    'user-name': 'Jane Doe',
    'user-email': 'jane@acme.com',
  };

  if(requestedAssessment.data.attributes.type === 'SMART_PLACEMENT') {
    newAssessment.type = 'SMART_PLACEMENT';
    return schema.assessments.create(newAssessment);
  }

  const allAssessments = [
    refAssessment,
  ];
  const courseId = requestedAssessment.data.relationships.course.data.id;
  const assessment = _.find(allAssessments,
    (assessment) => assessment.data.relationships.course.data.id === courseId);

  if (assessment) {
    return assessment;
  } else if (_.startsWith(courseId, 'null')) {
    return refAssessment;
  } else if (!_.startsWith(courseId, 'rec')) {
    newAssessment.type = 'CERTIFICATION';
    newAssessment.courseId = 'certification-number';
    newAssessment['certification-number'] = 'certification-number';
  }

  return schema.assessments.create(newAssessment);
}
