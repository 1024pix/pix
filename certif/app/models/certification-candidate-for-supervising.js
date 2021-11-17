import Model, { attr } from '@ember-data/model';
import { memberAction } from 'ember-api-actions';

export default class CertificationCandidateForSupervising extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('date-only') birthdate;
  @attr('number') extraTimePercentage;
  @attr('boolean') authorizedToStart;
  @attr('string') assessmentStatus;

  get hasStarted() {
    return this.assessmentStatus === 'started';
  }

  updateAuthorizedToStart = memberAction({
    type: 'patch',
    urlType: 'updateAuthorizedToStart',
    before(authorizedToStart) {
      return {
        'authorized-to-start': authorizedToStart,
      };
    },
  });
}
