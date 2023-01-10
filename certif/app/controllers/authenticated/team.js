import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class Team extends Controller {
  @service featureToggles;
  @service router;
  @tracked shouldShowRefererSelectionModal = false;
  @tracked selectedReferer = '';

  get shouldDisplayNoRefererSection() {
    return (
      this.model.hasCleaHabilitation &&
      _hasAtLeastOneMemberAndNoReferer(this.model.members) &&
      this.featureToggles.featureToggles.isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled
    );
  }

  get shouldDisplayUpdateRefererButton() {
    return (
      this.model.hasCleaHabilitation &&
      _hasAtLeastTwoMembersAndOneReferer(this.model.members) &&
      this.featureToggles.featureToggles.isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled
    );
  }

  get membersSelectOptionsSortedByLastName() {
    return this.model.members
      .toArray()
      .sort((member1, member2) => member1.lastName.localeCompare(member2.lastName, 'fr-FR', { sensitivity: 'base' }))
      .filter((member) => !member.isReferer)
      .map((member) => ({ value: member.id, label: `${member.firstName} ${member.lastName}` }));
  }

  @action
  onSelectReferer(option) {
    this.selectedReferer = option;
  }

  @action
  async onValidateReferer() {
    if (this.selectedReferer !== '') {
      const userId = this.selectedReferer;
      const member = this.model.members.toArray().find((member) => member.id === userId);
      await member.updateReferer({ userId: member.id, isReferer: true });
      this.shouldShowRefererSelectionModal = !this.shouldShowRefererSelectionModal;
      this.send('refreshModel');
    }
  }

  @action
  toggleRefererModal() {
    this.selectedReferer = '';
    this.shouldShowRefererSelectionModal = !this.shouldShowRefererSelectionModal;
  }
}

function _hasAtLeastOneMemberAndNoReferer(members) {
  return members.length > 0 && !members.toArray().some((member) => member.isReferer);
}

function _hasAtLeastTwoMembersAndOneReferer(members) {
  return members.length > 1 && members.toArray().some((member) => member.isReferer);
}
