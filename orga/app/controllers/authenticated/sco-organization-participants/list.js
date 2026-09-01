import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ListController extends Controller {
  @service currentUser;
  @service notifications;
  @service intl;
  @service errorMessages;
  @service store;
  @service router;

  @tracked isLoading = false;

  @tracked search = null;
  @tracked divisions = [];
  @tracked connectionTypes = [];
  @tracked certificability = [];
  @tracked pageNumber = null;
  @tracked pageSize = 50;
  @tracked participationCountOrder = null;
  @tracked latestParticipationSort = null;
  @tracked lastnameSort = 'asc';
  @tracked divisionSort = null;

  get hasComputeOrganizationLearnerCertificabilityEnabled() {
    return this.currentUser.prescriber.computeOrganizationLearnerCertificability;
  }

  @action
  goToLearnerPage(learner) {
    this.router.transitionTo('authenticated.sco-organization-participants.sco-organization-participant', learner.id);
  }

  @action
  sortByParticipationCount() {
    if (!this.participationCountOrder) this.participationCountOrder = 'asc';
    else this.participationCountOrder = this.participationCountOrder === 'asc' ? 'desc' : 'asc';

    this.divisionSort = null;
    this.pageNumber = null;
    this.lastnameSort = null;
    this.latestParticipationSort = null;
  }

  @action
  sortByLastname() {
    if (!this.lastnameSort) this.lastnameSort = 'asc';
    else this.lastnameSort = this.lastnameSort === 'asc' ? 'desc' : 'asc';

    this.divisionSort = null;
    this.participationCountOrder = null;
    this.pageNumber = null;
    this.latestParticipationSort = null;
  }

  @action
  sortByDivision() {
    if (!this.divisionSort) this.divisionSort = 'asc';
    else this.divisionSort = this.divisionSort === 'asc' ? 'desc' : 'asc';

    this.participationCountOrder = null;
    this.lastnameSort = null;
    this.pageNumber = null;
    this.latestParticipationSort = null;
  }

  @action
  sortByLatestParticipation() {
    if (!this.latestParticipationSort) this.latestParticipationSort = 'asc';
    else this.latestParticipationSort = this.latestParticipationSort === 'asc' ? 'desc' : 'asc';

    this.divisionSort = null;
    this.participationCountOrder = null;
    this.lastnameSort = null;
    this.pageNumber = null;
  }

  @action
  triggerFiltering(fieldName, value) {
    this[fieldName] = value || undefined;
    this.pageNumber = null;
  }

  @action
  resetFiltering() {
    this.pageNumber = null;
    this.divisions = [];
    this.connectionTypes = [];
    this.search = null;
    this.certificability = [];
  }

  @action
  refresh() {
    this.send('refreshModel');
  }
}
