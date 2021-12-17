import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CreateForm extends Component {
  @service currentUser;
  @tracked campaign;
  @tracked wantIdPix = false;
  @tracked multipleSendingsEnabled = true;
  @tracked isCampaignGoalAssessment = null;
  @tracked isCampaignGoalProfileCollection = null;
  @tracked targetProfile;

  constructor() {
    super(...arguments);
    this.campaign = {
      organization: this.currentUser.organization,
    };

    if (!this.currentUser.organization.canCollectProfiles) {
      this.isCampaignGoalAssessment = true;
      this.campaign.type = 'ASSESSMENT';
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
    this.campaign.idPixLabel = '';
  }

  @action
  doNotAskLabelIdPix() {
    this.wantIdPix = false;
    this.campaign.idPixLabel = null;
  }

  @action
  selectTargetProfile(event) {
    this.targetProfile = this.args.targetProfiles.find((targetProfile) => targetProfile.name === event.target.value);
    this.campaign.targetProfile = this.targetProfile;
  }

  @action
  selectMultipleSendingsStatus(event) {
    const status = Boolean(event.target.value);
    this.multipleSendingsEnabled = status;
    this.campaign.multipleSendings = status;
  }

  @action
  setCampaignGoal(event) {
    if (event.target.value === 'collect-participants-profile') {
      this.isCampaignGoalAssessment = false;
      this.isCampaignGoalProfileCollection = true;
      this.campaign.multipleSendings = true;
      this.campaign.title = null;
      this.campaign.targetProfile = null;
      this.targetProfile = null;
      this.campaign.type = 'PROFILES_COLLECTION';
    } else {
      this.isCampaignGoalAssessment = true;
      this.isCampaignGoalProfileCollection = false;
      this.campaign.multipleSendings = false;
      this.campaign.type = 'ASSESSMENT';
    }
  }

  @action
  onSubmit(event) {
    event.preventDefault();
    this.args.onSubmit(this.campaign);
  }
}
