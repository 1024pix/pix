import _ from 'mon-pix/utils/lodash-custom';

import refAssessment from '../data/assessments/ref-assessment';

export default function(schema, request) {

  const requestedAssessment = JSON.parse(request.requestBody);
  const newAssessment = {
    'user-id': 'user_id',
    'user-name': 'Jane Doe',
    'user-email': 'jane@acme.com',
  };

  const allAssessments = [
    refAssessment,
  ];
  let assessment;
  let courseId;
  if(requestedAssessment.data.relationships) {
    courseId = requestedAssessment.data.relationships.course.data.id;
    assessment = _.find(allAssessments,
      (assessment) => assessment.data.relationships.course.data.id === courseId);
  }

  if (assessment) {
    // PLACEMENT ASSESSMENT
    return assessment;

  } else if (_.startsWith(courseId, 'null')) {
    // PREVIEW ASSESSMENT
    return refAssessment;

  } else if (requestedAssessment.data.attributes.type === 'SMART_PLACEMENT') {
    // SMART ASSESSMENT
    newAssessment.type = 'SMART_PLACEMENT';

  } else if (!_.startsWith(courseId, 'rec')) {
    // CERTIFICATION ASSESSMENT
    newAssessment.type = 'CERTIFICATION';
    newAssessment.courseId = 'certification-number';
    newAssessment['certification-number'] = 'certification-number';

  }

  return schema.assessments.create(newAssessment);
}
