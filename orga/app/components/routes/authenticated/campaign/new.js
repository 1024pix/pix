import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class New extends Component {
  @service currentUser;

  @tracked wantIdPix = false;
  @tracked isCampaignGoalAssessment = null;

  constructor() {
    super(...arguments);
    if (!this.currentUser.organization.canCollectProfiles) {
      this.isCampaignGoalAssessment = true;
      this.args.campaign.type = 'ASSESSMENT';
    }
  }

  get notWantIdPix() {
    return !this.wantIdPix;
  }

  get targetProfilesOptions() {
    if (!this.args.targetProfiles) return [];
    return this.args.targetProfiles.map((targetProfile) => {
      return { value: targetProfile.id, label: targetProfile.name };
    });
  }

  @action
  askLabelIdPix() {
    this.wantIdPix = true;
    this.args.campaign.idPixLabel = '';
  }

  @action
  doNotAskLabelIdPix() {
    this.wantIdPix = false;
    this.args.campaign.idPixLabel = null;
  }

  @action
  setSelectedTargetProfile(event) {
    this.args.campaign.targetProfile = this.args.targetProfiles
      .find((targetProfile) => targetProfile.id === event.target.value);
    this.args.campaign.errors.remove('targetProfile');
  }

  @action
  setCampaignGoal(event) {
    if (event.target.value === 'collect-participants-profile') {
      this.isCampaignGoalAssessment = false;
      this.args.campaign.title = null;
      this.args.campaign.targetProfile = null;
      return this.args.campaign.type = 'PROFILES_COLLECTION';
    }
    this.isCampaignGoalAssessment = true;
    return this.args.campaign.type = 'ASSESSMENT';
  }
}
