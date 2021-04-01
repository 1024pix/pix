import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ProfilesController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'divisions'];
  @tracked pageNumber = 1;
  @tracked pageSize = 25;
  @tracked divisions = [];

  @action
  goToProfilePage(campaignId, campaignParticipationId) {
    this.transitionToRoute('authenticated.campaigns.profile', campaignId, campaignParticipationId);
  }

  @action
  triggerFiltering(filters) {
    this.pageNumber = null;
    this.divisions = filters.divisions;
  }

  @action
  resetFiltering() {
    this.pageNumber = null;
    this.divisions = [];
  }
}
