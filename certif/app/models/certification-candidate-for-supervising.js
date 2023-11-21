import Model, { attr } from '@ember-data/model';
import { memberAction } from 'ember-api-actions';

const assessmentStates = {
  COMPLETED: 'completed',
  STARTED: 'started',
  ABORTED: 'aborted',
  ENDED_BY_SUPERVISOR: 'endedBySupervisor',
};

export default class CertificationCandidateForSupervising extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('date-only') birthdate;
  @attr('number') extraTimePercentage;
  @attr('boolean') authorizedToStart;
  @attr('string') assessmentStatus;
  @attr('date') startDateTime;
  @attr('date') theoricalEndDateTime;
  @attr('string') enrolledComplementaryCertificationLabel;
  @attr('string') userId;
  @attr('boolean') isStillEligibleToComplementaryCertification;
  @attr() liveAlert;

  get hasStarted() {
    return this.assessmentStatus === 'started';
  }

  get isAuthorizedToResume() {
    return this.hasStarted && this.authorizedToStart;
  }

  get hasCompleted() {
    return [assessmentStates.COMPLETED, assessmentStates.ENDED_BY_SUPERVISOR].includes(this.assessmentStatus);
  }

  updateAuthorizedToStart = memberAction({
    type: 'post',
    urlType: 'updateAuthorizedToStart',
    before(authorizedToStart) {
      this.authorizedToStart = authorizedToStart;
      return {
        'authorized-to-start': authorizedToStart,
      };
    },
  });

  authorizeTestResume = memberAction({
    type: 'post',
    urlType: 'authorizeToResume',
  });

  endAssessmentBySupervisor = memberAction({
    type: 'patch',
    urlType: 'endAssessmentBySupervisor',
  });
}
