import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import _orderBy from 'lodash/orderBy';

export default class CreateForm extends Component {
  @service currentUser;
  @service intl;

  @tracked wantIdPix = Boolean(this.args.campaign.idPixLabel);
  @tracked targetProfiles = [];

  constructor() {
    super(...arguments);
    Promise.resolve(this.args.targetProfiles).then((targetProfiles) => {
      this.targetProfiles = targetProfiles;
    });
  }

  get isMultipleSendingAssessmentEnabled() {
    return this.currentUser.prescriber.enableMultipleSendingAssessment;
  }

  get isComputeLearnerCertificabilityEnabled() {
    return this.currentUser.prescriber.computeOrganizationLearnerCertificability;
  }

  get targetOwnerOptions() {
    const options = this.targetProfiles.map((targetProfile) => {
      return {
        value: targetProfile.id,
        label: targetProfile.name,
        category: this.intl.t(`pages.campaign-creation.tags.${targetProfile.category}`),
        order: 'OTHER' === targetProfile.category ? 1 : 0,
      };
    });
    return _orderBy(options, ['order', 'category', 'label']);
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
    return this.args.campaign.type === 'ASSESSMENT';
  }

  get isCampaignGoalProfileCollection() {
    return this.args.campaign.type === 'PROFILES_COLLECTION';
  }

  get isExternalIdNotSelectedChecked() {
    return this.args.campaign.idPixLabel === null;
  }

  get isExternalIdSelectedChecked() {
    return this.wantIdPix === true;
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
  selectTargetProfile(targetProfileId) {
    this.args.campaign.targetProfile = this.targetProfiles.find(
      (targetProfile) => targetProfile.id === targetProfileId,
    );
  }

  @action
  selectMultipleSendingsStatus(value) {
    this.args.campaign.multipleSendings = value;
  }

  @action
  setCampaignGoal(event) {
    if (event.target.value === 'collect-participants-profile') {
      this.args.campaign.setType('PROFILES_COLLECTION');
    } else {
      this.args.campaign.setType('ASSESSMENT');
    }
  }

  @action
  onChangeCampaignValue(key, event) {
    this.args.campaign[key] = event.target.value;
  }

  @action
  onChangeCampaignOwner(newOwnerId) {
    const selectedMember = this.args.membersSortedByFullName.find((member) => newOwnerId === member.id);
    if (selectedMember) {
      this.args.campaign.ownerId = selectedMember.id;
    }
  }

  @action
  onChangeCampaignCustomLandingPageText(event) {
    this.args.campaign.customLandingPageText = event.target.value;
  }

  @action
  onSubmit(event) {
    event.preventDefault();
    this.args.onSubmit(this.args.campaign);
  }
}
