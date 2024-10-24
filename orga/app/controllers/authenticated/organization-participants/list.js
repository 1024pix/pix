import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { decodeExtraFilters, encodeExtraFilters } from '../../../utils/extra-filter-serializer.js';

export default class ListController extends Controller {
  @service currentUser;
  @service router;
  @service store;
  @service notifications;
  @service intl;

  @tracked pageNumber = 1;
  @tracked pageSize = 50;
  @tracked extraFilters = encodeExtraFilters({});
  @tracked fullName = null;
  @tracked certificability = [];
  @tracked participationCountOrder = null;
  @tracked latestParticipationOrder = null;
  @tracked lastnameSort = 'asc';

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
    this.extraFilters = encodeExtraFilters({});
  }

  @action
  goToLearnerPage(learnerId, event) {
    if (this.hasOrganizationParticipantPage) {
      event.preventDefault();
      this.router.transitionTo('authenticated.organization-participants.organization-participant', learnerId);
    }
  }

  @action
  async toggleOralizationFeatureForParticipant(participantId, organizationId, toActivate) {
    if (toActivate) {
      await this.store
        .adapterFor('organization-participant')
        .addOralizationFeatureForParticipant(participantId, organizationId);
    } else {
      await this.store
        .adapterFor('organization-participant')
        .removeOralizationFeatureForParticipant(participantId, organizationId);
    }
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
