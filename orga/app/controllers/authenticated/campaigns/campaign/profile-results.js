import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ProfilesController extends Controller {
  @tracked pageNumber = 1;
  @tracked pageSize = 50;
  @tracked divisions = [];
  @tracked groups = [];
  @tracked search = null;

  @action
  goToProfilePage(campaignId, campaignParticipationId, event) {
    event.stopPropagation();
    event.preventDefault();
    this.transitionToRoute('authenticated.campaigns.participant-profile', campaignId, campaignParticipationId);
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
    this.groups = [];
    this.search = null;
  }
}
