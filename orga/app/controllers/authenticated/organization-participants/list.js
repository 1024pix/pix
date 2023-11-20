import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ListController extends Controller {
  @service currentUser;
  @service router;
  @service store;
  @service notifications;
  @service intl;

  @tracked pageNumber = 1;
  @tracked pageSize = 50;
  @tracked fullName = null;
  @tracked certificability = [];
  @tracked participationCountOrder = null;
  @tracked latestParticipationOrder = null;
  @tracked lastnameSort = 'asc';

  get hasComputeOrganizationLearnerCertificabilityEnabled() {
    return this.currentUser.prescriber.computeOrganizationLearnerCertificability;
  }

  @action
  triggerFiltering(fieldName, value) {
    this[fieldName] = value || undefined;
    this.pageNumber = null;
  }

  @action
  sortByParticipationCount(value) {
    this.participationCountOrder = value || null;
    this.pageNumber = null;
    this.latestParticipationOrder = null;
    this.lastnameSort = null;
  }

  @action
  sortByLatestParticipation(value) {
    this.latestParticipationOrder = value || null;
    this.pageNumber = null;
    this.participationCountOrder = null;
    this.lastnameSort = null;
  }

  @action
  sortByLastname(value) {
    this.lastnameSort = value || null;
    this.pageNumber = null;
    this.participationCountOrder = null;
    this.latestParticipationOrder = null;
  }

  @action
  resetFilters() {
    this.pageNumber = null;
    this.fullName = null;
    this.certificability = [];
  }

  @action
  goToLearnerPage(learnerId, event) {
    event.preventDefault();
    this.router.transitionTo('authenticated.organization-participants.organization-participant', learnerId);
  }

  @action
  async deleteOrganizationLearners(listLearners) {
    try {
      await this.store.adapterFor('organization-participant').deleteParticipants(
        this.currentUser.organization.id,
        listLearners.map(({ id }) => id),
      );
      this.send('refreshModel');
      this.notifications.sendSuccess(
        this.intl.t('pages.organization-participants.action-bar.success-message', {
          count: listLearners.length,
          firstname: listLearners[0].firstName,
          lastname: listLearners[0].lastName,
        }),
      );
    } catch {
      this.notifications.sendError(
        this.intl.t('pages.organization-participants.action-bar.error-message', {
          count: listLearners.length,
          firstname: listLearners[0].firstName,
          lastname: listLearners[0].lastName,
        }),
      );
    }
  }
}
