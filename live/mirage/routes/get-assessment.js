import completedAssessment from '../data/assessments/completed-assessment';
import inProgressAssessment from '../data/assessments/in-progress-assessment';

export default function (schema, request) {

  switch (request.params.id) {
    case inProgressAssessment.data.id:
      return inProgressAssessment;
    case completedAssessment.data.id:
      return completedAssessment;
    default:
      return completedAssessment;
  }

}
