import { memberAction } from '@1024pix/ember-api-actions';
import Model, { attr } from '@warp-drive/legacy/model';

const assessmentStates = {
  COMPLETED: 'completed',
  STARTED: 'started',
  ABORTED: 'aborted',
  ENDED_BY_INVIGILATOR: 'endedByInvigilator',
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
  @attr('string') subscription;
  @attr('string') userId;
  @attr('boolean') isStillEligibleToDoubleCertification;
  @attr() challengeLiveAlert;
  @attr() companionLiveAlert;

  get hasStarted() {
    return this.assessmentStatus === 'started';
  }

  get isAuthorizedToResume() {
    return this.hasStarted && this.authorizedToStart;
  }

  get hasCompleted() {
    return [assessmentStates.COMPLETED, assessmentStates.ENDED_BY_INVIGILATOR].includes(this.assessmentStatus);
  }

  get hasOngoingChallengeLiveAlert() {
    return this.currentLiveAlert?.type === 'challenge' && this.currentLiveAlert?.status === 'ongoing';
  }

  get hasOngoingCompanionLiveAlert() {
    return this.currentLiveAlert?.type === 'companion' && this.currentLiveAlert?.status === 'ONGOING';
  }

  get currentLiveAlert() {
    return this.companionLiveAlert ?? this.challengeLiveAlert;
  }

  get isEnrolledToDoubleCertification() {
    return this.subscription === 'CLEA';
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

  endAssessmentByInvigilator = memberAction({
    type: 'patch',
    urlType: 'endAssessmentByInvigilator',
  });
}
