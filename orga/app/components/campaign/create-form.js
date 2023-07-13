import { service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import _orderBy from 'lodash/orderBy';

export default class CreateForm extends Component {
  @service currentUser;
  @service intl;

  @tracked campaign;
  @tracked wantIdPix = Boolean(this.campaign.idPixLabel);
  @tracked multipleSendingsEnabled = true;
  @tracked targetProfile;
  @tracked targetProfilesOptions = [];

  constructor() {
    super(...arguments);
    this.campaign = this.args.campaign;
    this._setTargetProfilesOptions(this.args.targetProfiles);
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

  get isCampaignGoalAssessment() {
    return this.campaign.type === 'ASSESSMENT';
  }

  get isCampaignGoalProfileCollection() {
    return this.campaign.type === 'PROFILES_COLLECTION';
  }

  get isExternalIdNotSelectedChecked() {
    return this.campaign.idPixLabel === null;
  }

  get isExternalIdSelectedChecked() {
    return this.wantIdPix === true;
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
    this.campaign.targetProfile = this.args.targetProfiles.find(
      (targetProfile) => targetProfile.id === targetProfileId,
    );
  }

  @action
  selectMultipleSendingsStatus(value) {
    this.multipleSendingsEnabled = value;
    this.campaign.multipleSendings = value;
  }

  @action
  setCampaignGoal(event) {
    if (event.target.value === 'collect-participants-profile') {
      this.campaign.setType('PROFILES_COLLECTION');
    } else {
      this.campaign.setType('ASSESSMENT');
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
      this.campaign.ownerId = selectedMember.id;
    }
  }

  @action
  onSubmit(event) {
    event.preventDefault();
    this.args.onSubmit(this.campaign);
  }
}
