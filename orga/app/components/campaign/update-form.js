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

  get ownerIdOption() {
    return this.args.campaign.ownerId.toString();
  }

  @action
  onChangeCampaignOwner(newOwnerId) {
    const selectedMember = this.args.membersSortedByFullName.find((member) => newOwnerId === member.id);
    if (selectedMember) {
      this.args.campaign.ownerId = selectedMember.id;
    }
  }

  @action
  onChangeCampaignName(event) {
    this.args.campaign.name = event.target.value;
  }

  @action
  onChangeCampaignTitle(event) {
    this.args.campaign.title = event.target.value;
  }

  @action
  onChangeCampaignCustomLandingPageText(event) {
    this.args.campaign.customLandingPageText = event.target.value;
  }

  _handleErrors(errorResponse) {
    const errors = errorResponse.errors;
    if (!errors) {
      return this.notifications.error(this.intl.t('api-error-messages.global'));
    }
    return errorResponse.errors.forEach((error) => {
      if (error.status !== '422') {
        return this.notifications.error(this.intl.t('api-error-messages.global'));
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
