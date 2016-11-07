import completedAssessment from '../data/assessments/completed-assessment';
import completedAssessmentQcm from '../data/assessments/completed-assessment-qcm';
import inProgressAssessment from '../data/assessments/in-progress-assessment';

export default function (schema, request) {

  switch (request.params.id) {
    case inProgressAssessment.data.id:
      return inProgressAssessment;
    case completedAssessment.data.id:
      return completedAssessment;
    case completedAssessmentQcm.data.id:
      return completedAssessmentQcm;
    default:
      return completedAssessment;
  }

}
