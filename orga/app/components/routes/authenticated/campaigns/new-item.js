import { action, computed } from '@ember/object';
import Component from '@ember/component';
import { tracked } from '@glimmer/tracking';

export default class NewItem extends Component {

  campaign = null;
  targetProfiles = null;
  wantIdPix = false;
  @tracked isCampaignGoalAssessment = null;

  @computed('wantIdPix')
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
      return this.campaign.type = 'PROFILES_COLLECTION';
    }
    this.isCampaignGoalAssessment = true;
    return this.campaign.type = 'ASSESSMENT';
  }
}
