import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class Team extends Controller {
  @service featureToggles;
  @tracked shouldShowRefererSelectionModal = false;

  get shouldDisplayNoRefererSection() {
    return (
      this.model.hasCleaHabilitation &&
      _hasNoReferer(this.model.members) &&
      this.featureToggles.featureToggles.isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled
    );
  }

  @action
  toggleRefererModal() {
    this.shouldShowRefererSelectionModal = !this.shouldShowRefererSelectionModal;
  }
}

function _hasNoReferer(members) {
  return !members.toArray().some((member) => member.isReferer);
}
