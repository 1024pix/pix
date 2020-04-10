import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@ember/component';
import { tracked } from '@glimmer/tracking';

export default class NewItem extends Component {
  @service currentUser;

  campaign = {};
  targetProfiles = null;
  @tracked wantIdPix = false;
  @tracked isCampaignGoalAssessment = null;

  init() {
    super.init(...arguments);
    if (!this.currentUser.organization.canCollectProfiles) {
      this.isCampaignGoalAssessment = true;
      this.campaign.type = 'ASSESSMENT';
    }
  }

  get notWantIdPix() {
    return !this.wantIdPix;
  }

  @action
  askLabelIdPix() {
    this.set('wantIdPix', true);
    this.set('campaign.idPixLabel', '');
  }

  @action
  doNotAskLabelIdPix() {
    this.set('wantIdPix', false);
    this.set('campaign.idPixLabel', null);
  }

  @action
  setSelectedTargetProfile(event) {
    const selectedTargetProfile = this.targetProfiles
      .find((targetProfile) => targetProfile.get('id') === event.target.value);
    this.campaign.set('targetProfile', selectedTargetProfile);
  }

  @action
  setCampaignGoal(event) {
    if (event.target.value === 'collect-participants-profile') {
      this.isCampaignGoalAssessment = false;
      this.campaign.title = null;
      this.campaign.targetProfile = null;
      return this.campaign.type = 'PROFILES_COLLECTION';
    }
    this.isCampaignGoalAssessment = true;
    return this.campaign.type = 'ASSESSMENT';
  }
}
