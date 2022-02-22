import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class UpdateForm extends Component {
  @service notifications;
  @service intl;

  @tracked name;
  @tracked title;
  @tracked customLandingPageText;

  constructor() {
    super(...arguments);
    this.name = this.args.campaign.name;
    this.title = this.args.campaign.title;
    this.customLandingPageText = this.args.campaign.customLandingPageText;
  }

  get campaignOwnerOptions() {
    if (!this.args.membersSortedByFullName) return [];

    return this.args.membersSortedByFullName.map((member) => ({ value: member.id, label: member.fullName }));
  }

  @action
  selectOwner(event) {
    const newOwnerFullName = event.target.value;
    const selectedMember = this.args.membersSortedByFullName.find((member) => newOwnerFullName === member.fullName);
    if (selectedMember) {
      this.args.campaign.ownerId = selectedMember.id;
    }
  }

  @action
  onChangeCampaignName(event) {
    const nameTrim = event.target.value.trim();
    this.args.campaign.name = nameTrim || null;
  }

  @action
  onChangeCampaignTitle(event) {
    const titleTrim = event.target.value.trim();
    this.args.campaign.title = titleTrim || null;
  }

  @action
  onChangeCampaignCustomLandingPageText(event) {
    const customLandingPageTextTrim = event.target.value.trim();
    this.args.campaign.customLandingPageText = customLandingPageTextTrim || null;
  }

  _handleErrors(errorResponse) {
    const errors = errorResponse.errors;
    if (!errors) {
      return this.notifications.error(this.intl.t('api-errors-messages.global'));
    }
    return errorResponse.errors.forEach((error) => {
      if (error.status !== '422') {
        return this.notifications.error(this.intl.t('api-errors-messages.global'));
      }
    });
  }

  @action
  async onSubmit(event) {
    event.preventDefault();
    try {
      await this.args.onSubmit();
    } catch (errorResponse) {
      this._handleErrors(errorResponse);
    }
  }
}
