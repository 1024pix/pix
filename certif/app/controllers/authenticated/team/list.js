import { service } from '@ember/service';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AuthenticatedTeamListController extends Controller {
  @service currentUser;
  @service featureToggles;
  @service router;
  @service notifications;
  @service intl;

  @tracked shouldShowRefererSelectionModal = false;
  @tracked selectedReferer = '';

  get shouldDisplayNavbarSection() {
    return this.currentUser.isAdminOfCurrentCertificationCenter;
  }

  get shouldDisplayNoRefererSection() {
    return this.model.hasCleaHabilitation && _hasAtLeastOneMemberAndNoReferer(this.model.members);
  }

  get shouldDisplayUpdateRefererButton() {
    return this.model.hasCleaHabilitation && _hasAtLeastTwoMembersAndOneReferer(this.model.members);
  }

  get shouldDisplayInviteMemberButton() {
    return !!this.currentUser.isAdminOfCurrentCertificationCenter;
  }

  get membersSelectOptionsSortedByLastName() {
    return [...this.model.members]
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
      const member = this.model.members.find((member) => member.id === userId);

      try {
        await member.updateReferer({ userId: member.id, isReferer: true });
        this.shouldShowRefererSelectionModal = !this.shouldShowRefererSelectionModal;
        this.send('refreshModel');
      } catch (responseError) {
        this.notifications.error(this.intl.t('common.api-error-messages.internal-server-error'));
      }
    }
  }

  @action
  toggleRefererModal() {
    this.selectedReferer = '';
    this.shouldShowRefererSelectionModal = !this.shouldShowRefererSelectionModal;
  }
}

function _hasAtLeastOneMemberAndNoReferer(members) {
  return members.length > 0 && !members.some((member) => member.isReferer);
}

function _hasAtLeastTwoMembersAndOneReferer(members) {
  return members.length > 1 && members.some((member) => member.isReferer);
}
