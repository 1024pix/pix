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
  @tracked lastnameSort = 'asc';
  @tracked divisionSort = null;

  get hasComputeOrganizationLearnerCertificabilityEnabled() {
    return this.currentUser.prescriber.computeOrganizationLearnerCertificability;
  }

  @action
  goToLearnerPage(learnerId, event) {
    event.preventDefault();
    this.router.transitionTo('authenticated.sco-organization-participants.sco-organization-participant', learnerId);
  }

  @action
  sortByParticipationCount(value) {
    this.participationCountOrder = value;
    this.divisionSort = null;
    this.pageNumber = null;
    this.lastnameSort = null;
  }

  @action
  sortByLastname(value) {
    this.lastnameSort = value;
    this.divisionSort = null;
    this.participationCountOrder = null;
    this.pageNumber = null;
  }

  @action
  sortByDivision(value) {
    this.divisionSort = value;
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
