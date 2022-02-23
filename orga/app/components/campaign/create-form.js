import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import _sortBy from 'lodash/sortBy';
import _find from 'lodash/find';
import _pull from 'lodash/pull';
import _uniq from 'lodash/uniq';

export default class CreateForm extends Component {
  @service currentUser;
  @service intl;

  @tracked campaign;
  @tracked wantIdPix = false;
  @tracked multipleSendingsEnabled = true;
  @tracked isCampaignGoalAssessment = null;
  @tracked isCampaignGoalProfileCollection = null;
  @tracked targetProfile;
  @tracked selectedCategories = [];
  @tracked targetProfilesOptions = [];
  @tracked displayDeleteInputButton = false;

  constructor() {
    super(...arguments);
    this.campaign = {
      organization: this.currentUser.organization,
    };
    this._setTargetProfilesOptions(this.args.targetProfiles);

    this.campaign.ownerId = this.currentUser.prescriber.id;
  }

  get currentUserOptionId() {
    const currentUserOption = this.args.membersSortedByFullName.find(
      (member) => member.get('fullName') === this.currentUser.prescriber.fullName
    );
    return currentUserOption.get('id');
  }

  get categories() {
    if (!this.args.targetProfiles) return [];
    let allCategories = _uniq(this.args.targetProfiles.map((targetProfile) => targetProfile.category));

    const otherCategoryIsPresents = allCategories.includes('OTHER');
    allCategories = allCategories.map((category) => {
      return { name: category, translation: this.intl.t(`pages.campaign-creation.tags.${category}`) };
    });

    allCategories = _sortBy(allCategories, 'translation');

    if (otherCategoryIsPresents) {
      const other = _find(allCategories, ['name', 'OTHER']);
      _pull(allCategories, other);
      allCategories.push(other);
    }

    return allCategories;
  }

  _filterTargetProfilesOptions() {
    if (!this.args.targetProfiles) return [];
    if (this.selectedCategories.length > 0) {
      const filteredTargetProfiles = [];
      this.selectedCategories.forEach((category) => {
        const targetProfilesForOneCategory = this.args.targetProfiles.filter((targetProfile) => {
          return targetProfile.category === category;
        });
        filteredTargetProfiles.push(...targetProfilesForOneCategory);
      });
      this._setTargetProfilesOptions(filteredTargetProfiles);
    } else {
      this._setTargetProfilesOptions(this.args.targetProfiles);
    }
  }

  _setTargetProfilesOptions(targetProfiles) {
    if (!targetProfiles) return [];
    this.targetProfilesOptions = targetProfiles.map((targetProfile) => {
      return { value: targetProfile.id, label: targetProfile.name };
    });
  }

  get campaignOwnerOptions() {
    if (!this.args.membersSortedByFullName) return [];

    return this.args.membersSortedByFullName.map((member) => ({ value: member.id, label: member.fullName }));
  }

  _isTargetProfileInputEmpty() {
    return document.getElementById('campaign-target-profile').value.length === 0;
  }

  _toggleDeleteButton() {
    if (!this._isTargetProfileInputEmpty()) {
      this.displayDeleteInputButton = true;
    } else {
      this.displayDeleteInputButton = false;
    }
  }

  @action
  cleanInput() {
    const input = document.getElementById('campaign-target-profile');
    input.value = '';
    this.displayDeleteInputButton = false;
    this.targetProfile = '';
  }

  @action
  toggleCategory(category, isChecked) {
    if (isChecked) {
      this.selectedCategories.push(category);
    } else {
      this.selectedCategories = this.selectedCategories.filter((oldCategory) => oldCategory !== category);
    }
    this._filterTargetProfilesOptions();
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
    this._toggleDeleteButton();
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
  onChangeCampaignName(event) {
    this.campaign.name = event.target.value?.trim();
  }

  @action
  onChangeExternalIdLabel(event) {
    this.campaign.idPixLabel = event.target.value;
  }

  @action
  onChangeCampaignTitle(event) {
    this.campaign.title = event.target.value?.trim();
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
