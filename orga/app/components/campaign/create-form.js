import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import _orderBy from 'lodash/orderBy';

export default class CreateForm extends Component {
  @service currentUser;
  @service intl;

  @tracked campaign;
  @tracked wantIdPix = false;
  @tracked multipleSendingsEnabled = true;
  @tracked isCampaignGoalAssessment = null;
  @tracked isCampaignGoalProfileCollection = null;
  @tracked targetProfile;
  @tracked targetProfilesOptions = [];
  @tracked ownerId;

  constructor() {
    super(...arguments);
    this.campaign = {
      organization: this.currentUser.organization,
    };
    this._setTargetProfilesOptions(this.args.targetProfiles);
    this.ownerId = this.currentUser.prescriber.id;
    this.isMultipleSendingAssessmentEnabled = this.currentUser.prescriber.enableMultipleSendingAssessment;
  }

  _setTargetProfilesOptions(targetProfiles) {
    const options = targetProfiles.map((targetProfile) => {
      return {
        value: targetProfile.id,
        label: targetProfile.name,
        category: this.intl.t(`pages.campaign-creation.tags.${targetProfile.category}`),
        order: 'OTHER' === targetProfile.category ? 1 : 0,
      };
    });
    this.targetProfilesOptions = _orderBy(options, ['order', 'category', 'label']);
  }

  get campaignOwnerOptions() {
    if (!this.args.membersSortedByFullName) return [];

    return this.args.membersSortedByFullName.map((member) => ({ value: member.id, label: member.fullName }));
  }

  get isMultipleSendingEnabled() {
    return (
      this.isCampaignGoalProfileCollection || (this.isCampaignGoalAssessment && this.isMultipleSendingAssessmentEnabled)
    );
  }

  get multipleSendingWording() {
    if (this.isCampaignGoalProfileCollection) {
      return {
        label: 'pages.campaign-creation.multiple-sendings.profiles.question-label',
        info: 'pages.campaign-creation.multiple-sendings.profiles.info',
      };
    } else {
      return {
        label: 'pages.campaign-creation.multiple-sendings.assessments.question-label',
        info: 'pages.campaign-creation.multiple-sendings.assessments.info',
      };
    }
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
  selectTargetProfile(targetProfileId) {
    this.targetProfile = this.args.targetProfiles.find((targetProfile) => targetProfile.id === targetProfileId);
    this.campaign.targetProfile = this.targetProfile;
  }

  @action
  selectMultipleSendingsStatus(value) {
    this.multipleSendingsEnabled = value;
    this.campaign.multipleSendings = value;
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
  onChangeCampaignName(event) {
    this.campaign.name = event.target.value;
  }

  @action
  onChangeExternalIdLabel(event) {
    this.campaign.idPixLabel = event.target.value;
  }

  @action
  onChangeCampaignTitle(event) {
    this.campaign.title = event.target.value;
  }

  @action
  onChangeCampaignOwner(newOwnerId) {
    const selectedMember = this.args.membersSortedByFullName.find((member) => newOwnerId === member.id);
    if (selectedMember) {
      this.ownerId = selectedMember.id;
    }
  }

  @action
  onSubmit(event) {
    event.preventDefault();
    this.campaign.ownerId = this.ownerId;
    this.args.onSubmit(this.campaign);
  }
}
