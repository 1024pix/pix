import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { decodeExtraFilters, encodeExtraFilters } from '../../../utils/extra-filter-serializer.js';

export default class ListController extends Controller {
  @service currentUser;
  @service router;
  @service store;
  @service pixToast;
  @service intl;

  @tracked pageNumber = 1;
  @tracked pageSize = 50;
  @tracked extraFilters = encodeExtraFilters({});
  @tracked fullName = null;
  @tracked certificability = [];
  @tracked participationCountOrder = null;
  @tracked latestParticipationOrder = null;
  @tracked lastnameSort = 'asc';
  @tracked divisionSort = null;

  get hasComputeOrganizationLearnerCertificabilityEnabled() {
    return this.currentUser.prescriber.computeOrganizationLearnerCertificability;
  }

  get hasOrganizationParticipantPage() {
    return !this.currentUser.canAccessMissionsPage;
  }

  get decodedExtraFilters() {
    return decodeExtraFilters(this.extraFilters);
  }

  @action
  triggerFiltering(fieldName, value) {
    if (fieldName.includes('.')) {
      const [, property] = fieldName.split('.');
      const queryParamValue = decodeExtraFilters(this.extraFilters);
      queryParamValue[property] = value || undefined;
      this.extraFilters = encodeExtraFilters(queryParamValue);
    } else {
      this[fieldName] = value || undefined;
    }
    this.pageNumber = null;
  }

  @action
  sortByParticipationCount() {
    if (!this.participationCountOrder) this.participationCountOrder = 'asc';
    else this.participationCountOrder = this.participationCountOrder === 'asc' ? 'desc' : 'asc';

    this.pageNumber = null;
    this.latestParticipationOrder = null;
    this.lastnameSort = null;
    this.divisionSort = null;
  }

  @action
  sortByLatestParticipation() {
    if (!this.latestParticipationOrder) this.latestParticipationOrder = 'asc';
    else this.latestParticipationOrder = this.latestParticipationOrder === 'asc' ? 'desc' : 'asc';

    this.pageNumber = null;
    this.participationCountOrder = null;
    this.lastnameSort = null;
    this.divisionSort = null;
  }

  @action
  sortByLastname() {
    if (!this.lastnameSort) this.lastnameSort = 'asc';
    else this.lastnameSort = this.lastnameSort === 'asc' ? 'desc' : 'asc';

    this.pageNumber = null;
    this.participationCountOrder = null;
    this.latestParticipationOrder = null;
    this.divisionSort = null;
  }

  @action
  sortByDivision() {
    if (!this.divisionSort) this.divisionSort = 'asc';
    else this.divisionSort = this.divisionSort === 'asc' ? 'desc' : 'asc';

    this.pageNumber = null;
    this.participationCountOrder = null;
    this.latestParticipationOrder = null;
    this.lastnameSort = null;
  }

  @action
  resetFilters() {
    this.pageNumber = null;
    this.fullName = null;
    this.certificability = [];
    this.extraFilters = encodeExtraFilters({});
  }

  @action
  goToLearnerPage(learner) {
    if (this.hasOrganizationParticipantPage) {
      this.router.transitionTo('authenticated.organization-participants.organization-participant', learner.id);
    }
  }

  @action
  async toggleOralizationFeatureForParticipant(participantId, organizationId, toActivate) {
    const organizationParticipantAdapter = this.store.adapterFor('organization-participant');
    if (toActivate) {
      await organizationParticipantAdapter.addOralizationFeatureForParticipant(participantId, organizationId);
    } else {
      await organizationParticipantAdapter.removeOralizationFeatureForParticipant(participantId, organizationId);
    }
    this.send('refreshModel');
  }

  @action
  async deleteOrganizationLearners(listLearners) {
    try {
      await this.store.adapterFor('organization-participant').deleteParticipants(
        this.currentUser.organization.id,
        listLearners.map(({ id }) => id),
      );
      this.send('refreshModel');
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.organization-participants.action-bar.success-message', {
          count: listLearners.length,
          firstname: listLearners[0].firstName,
          lastname: listLearners[0].lastName,
        }),
      });
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
