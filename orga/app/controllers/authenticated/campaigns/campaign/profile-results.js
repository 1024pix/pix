import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ProfilesController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'divisions', 'groups'];
  @tracked pageNumber = 1;
  @tracked pageSize = 25;
  @tracked divisions = [];
  @tracked groups = [];

  @action
  goToProfilePage(campaignId, campaignParticipationId, event) {
    event.stopPropagation();
    event.preventDefault();
    this.transitionToRoute('authenticated.campaigns.participant-profile', campaignId, campaignParticipationId);
  }

  @action
  triggerFiltering(filters) {
    this.pageNumber = null;
    this.divisions = filters.divisions;
    this.groups = filters.groups;
  }

  @action
  resetFiltering() {
    this.pageNumber = null;
    this.divisions = [];
    this.groups = [];
  }
}
