import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import displayCampaignErrors from '../../helpers/display-campaign-errors';

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
      return this.notifications.sendError(this.intl.t('api-error-messages.global'));
    }
    return errorResponse.errors.forEach((error) => {
      if (error.status !== '422') {
        return this.notifications.sendError(this.intl.t('api-error-messages.global'));
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

  <template>
    <form class="form" {{on "submit" this.onSubmit}}>
      <p class="form__mandatory-fields-information" aria-hidden="true">
        <abbr title={{t "common.form.mandatory-fields-title"}} class="mandatory-mark">*</abbr>
        {{t "common.form.mandatory-fields"}}
      </p>
      <div class="form__field">
        <PixInput
          @id="campaign-name"
          @name="campaign-name"
          @requiredLabel={{t "common.form.mandatory-fields-title"}}
          class="input"
          maxlength="255"
          aria-required={{true}}
          required={{true}}
          @value={{this.name}}
          {{on "change" this.onChangeCampaignName}}
        >
          <:label>{{t "pages.campaign-modification.campaign-name"}}</:label>
        </PixInput>
        {{#if @campaign.errors.name}}
          <div class="form__error error-message">
            {{displayCampaignErrors @campaign.errors.name}}
          </div>
        {{/if}}
      </div>

      <div class="form__field-with-info form__field">
        <PixSelect
          class="pix-select-owner"
          @options={{this.campaignOwnerOptions}}
          @onChange={{this.onChangeCampaignOwner}}
          @value={{this.ownerIdOption}}
          @isSearchable={{true}}
          @placeholder={{t "pages.campaign-creation.owner.placeholder"}}
          @searchLabel={{t "pages.campaign-creation.owner.search-placeholder"}}
          @searchPlaceholder={{t "pages.campaign-creation.owner.search-placeholder"}}
          @requiredLabel={{t "common.form.mandatory-fields-title"}}
          @hideDefaultOption={{true}}
        >
          <:label>{{t "pages.campaign-creation.owner.label"}}</:label>
        </PixSelect>
        {{#if @campaign.errors.owner}}
          <div class="form__error error-message">
            {{displayCampaignErrors @campaign.errors.owner}}
          </div>
        {{/if}}

        <div class="form__field-info">
          <span class="form__field-info-title">
            <FaIcon @icon="circle-info" class="form__field-info-icon" />
            <span>{{t "pages.campaign-modification.owner.title"}}</span>
          </span>
          <span class="form__field-info-message">{{t "pages.campaign-modification.owner.info"}}</span>
        </div>
      </div>

      {{#if @campaign.isTypeAssessment}}
        <div class="form__field">
          <PixInput
            @id="campaign-title"
            @name="campaign-title"
            class="form-control"
            maxlength="50"
            @value={{this.title}}
            {{on "change" this.onChangeCampaignTitle}}
          >
            <:label>{{t "pages.campaign-modification.personalised-test-title"}}</:label>
          </PixInput>
          {{#if @campaign.errors.title}}
            <div class="form__error error-message">
              {{displayCampaignErrors @campaign.errors.title}}
            </div>
          {{/if}}
        </div>
      {{/if}}

      <div class="form__field">
        <PixTextarea
          @id="campaign-custom-landing-page-text"
          class="form-control"
          @maxlength={{5000}}
          @value={{this.customLandingPageText}}
          {{on "change" this.onChangeCampaignCustomLandingPageText}}
          rows={{8}}
        >
          <:label>{{t "pages.campaign-modification.landing-page-text"}}</:label>
        </PixTextarea>
        {{#if @campaign.errors.customLandingPageText}}
          <div class="form__error error-message">
            {{displayCampaignErrors @campaign.errors.customLandingPageText}}
          </div>
        {{/if}}
      </div>

      <div class="form__validation">
        <PixButton @triggerAction={{fn @onCancel @campaign.id}} @variant="secondary">
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @type="submit">
          {{t "pages.campaign-modification.actions.edit"}}
        </PixButton>
      </div>
    </form>
  </template>
}
