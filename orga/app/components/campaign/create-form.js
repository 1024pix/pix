import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CreateForm extends Component {
  @service currentUser;

  @tracked wantIdPix = false;
  @tracked multipleSendingsEnabled = true;
  @tracked isCampaignGoalAssessment = null;
  @tracked isCampaignGoalProfileCollection = null;

  constructor() {
    super(...arguments);
    this.args.campaign.organization = this.currentUser.organization;
    if (!this.currentUser.organization.canCollectProfiles) {
      this.isCampaignGoalAssessment = true;
      this.args.campaign.type = 'ASSESSMENT';
    }
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
    this.args.campaign.targetProfile = this.args.targetProfiles.find(
      (targetProfile) => targetProfile.id === event.target.value
    );
    this.args.campaign.errors.remove('targetProfile');
  }

  @action
  selectMultipleSendingsStatus(event) {
    const status = Boolean(event.target.value);
    this.multipleSendingsEnabled = status;
    this.args.campaign.multipleSendings = status;
  }

  @action
  setCampaignGoal(event) {
    if (event.target.value === 'collect-participants-profile') {
      this.isCampaignGoalAssessment = false;
      this.isCampaignGoalProfileCollection = true;
      this.args.campaign.multipleSendings = true;
      this.args.campaign.title = null;
      this.args.campaign.targetProfile = null;
      return (this.args.campaign.type = 'PROFILES_COLLECTION');
    }
    this.isCampaignGoalAssessment = true;
    this.isCampaignGoalProfileCollection = false;
    this.args.campaign.multipleSendings = false;
    return (this.args.campaign.type = 'ASSESSMENT');
  }
}
