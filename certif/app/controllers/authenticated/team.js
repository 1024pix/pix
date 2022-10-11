import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable ember/no-computed-properties-in-native-classes*/
import { alias } from '@ember/object/computed';

export default class Team extends Controller {
  @service featureToggles;
  @alias('model') members;

  get shouldDisplayNoRefererSection() {
    return (
      _hasNoReferer(this.members) &&
      this.featureToggles.featureToggles.isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled
    );
  }
}

function _hasNoReferer(members) {
  return !members.toArray().some((member) => member.isReferer);
}
