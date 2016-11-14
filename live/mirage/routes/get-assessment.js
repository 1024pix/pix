import completedAssessment from '../data/assessments/completed-assessment';
import completedAssessmentQcm from '../data/assessments/completed-assessment-qcm';
import completedAssessmentQroc from '../data/assessments/completed-assessment-qroc';
import inProgressAssessment from '../data/assessments/in-progress-assessment';

export default function (schema, request) {

  switch (request.params.id) {
    case inProgressAssessment.data.id:
      return inProgressAssessment;
    case completedAssessment.data.id:
      return completedAssessment;
    case completedAssessmentQcm.data.id:
      return completedAssessmentQcm;
    case completedAssessmentQroc.data.id:
      return completedAssessmentQroc;
    default:
      return completedAssessment;
  }

}
