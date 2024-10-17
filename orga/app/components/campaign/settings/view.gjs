import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import { ID_PIX_TYPES } from '../../../helpers/id-pix-types';
import CopyPasteButton from '../../copy-paste-button';
import SafeMarkdownToHtml from '../../safe-markdown-to-html';
import TargetProfileTooltip from './target-profile-tooltip';

export default class CampaignView extends Component {
  @service store;
  @service notifications;
  @service url;
  @service intl;
  @service currentUser;

  get displayCampaignActionsButtons() {
    const campaignIsNotArchived = !this.args.campaign.isArchived;

    const isCurrentUserAdmin = this.currentUser.prescriber.isAdminOfTheCurrentOrganization;
    const isCurrentUserOwnerOfTheCampaign = parseInt(this.currentUser.prescriber.id) === this.args.campaign.ownerId;
    const isCurrentUserAllowedToUpdateCampaign = isCurrentUserAdmin || isCurrentUserOwnerOfTheCampaign;

    return campaignIsNotArchived && isCurrentUserAllowedToUpdateCampaign;
  }

  get displayCampaignsRootUrl() {
    return !this.currentUser.prescriber.hasCurrentOrganizationWithGARAsIdentityProvider;
  }

  get campaignsRootUrl() {
    return `${this.url.campaignsRootUrl}${this.args.campaign.code}`;
  }

  get campaignType() {
    return this.args.campaign.isTypeAssessment
      ? this.intl.t('pages.campaign-settings.campaign-type.assessment')
      : this.intl.t('pages.campaign-settings.campaign-type.profiles-collection');
  }

  get multipleSendingsText() {
    return this.args.campaign.multipleSendings
      ? this.intl.t('pages.campaign-settings.multiple-sendings.status.enabled')
      : this.intl.t('pages.campaign-settings.multiple-sendings.status.disabled');
  }

  get multipleSendingsTooltipText() {
    return this.intl.t('pages.campaign-settings.multiple-sendings.tooltip.text');
  }

  get isMultipleSendingsEnable() {
    return !this.args.campaign.isTypeAssessment || this.isMultipleSendingsForAssessmentEnabled;
  }

  get isMultipleSendingsForAssessmentEnabled() {
    return this.args.campaign.isTypeAssessment && this.currentUser.prescriber.enableMultipleSendingAssessment;
  }

  get displayResetToZero() {
    return this.isMultipleSendingsForAssessmentEnabled && this.args.campaign.multipleSendings;
  }

  get resetToZeroText() {
    return this.args.campaign.targetProfileAreKnowledgeElementsResettable
      ? this.intl.t('pages.campaign-settings.reset-to-zero.status.enabled')
      : this.intl.t('pages.campaign-settings.reset-to-zero.status.disabled');
  }

  get queryForDuplicate() {
    return { source: this.args.campaign.id };
  }

  get idPixTypeText() {
    return ID_PIX_TYPES[this.args.campaign.idPixType];
  }

  @action
  async archiveCampaign(campaignId) {
    try {
      const campaign = this.store.peekRecord('campaign', campaignId);
      await campaign.archive();
    } catch (err) {
      this.notifications.sendError(this.intl.t('api-error-messages.global'));
    }
  }

  <template>
    <div class="panel campaign-settings">
      <dl>
        <div class="campaign-settings-row">
          <div class="campaign-settings-content">
            <dt class="label-text campaign-settings-content__label">{{t
                "pages.campaign-settings.campaign-type.title"
              }}</dt>
            <dd class="content-text campaign-settings-content__text">{{this.campaignType}}</dd>
          </div>
          {{#if this.isMultipleSendingsEnable}}
            <div class="campaign-settings-content">
              <dt class="label-text campaign-settings-content__label campaign-settings-content__label--with-tooltip">
                <span>{{t "pages.campaign-settings.multiple-sendings.title"}}</span>
                <PixTooltip @id="credit-info-tooltip" @position="top" @isWide={{true}}>
                  <:triggerElement>
                    <FaIcon
                      @icon="circle-info"
                      class="campaign-settings-content__tooltip-icon"
                      tabindex="0"
                      aria-describedby={{t
                        "pages.campaign-settings.multiple-sendings.tooltip.aria-label"
                        htmlSafe=true
                      }}
                    />
                  </:triggerElement>
                  <:tooltip>
                    {{this.multipleSendingsTooltipText}}
                  </:tooltip>
                </PixTooltip>
              </dt>
              <dd class="content-text campaign-settings-content__text">{{this.multipleSendingsText}}</dd>
            </div>
          {{/if}}
          {{#if this.displayResetToZero}}
            <div class="campaign-settings-content">
              <dt class="label-text campaign-settings-content__label campaign-settings-content__label--with-tooltip">
                <span>{{t "pages.campaign-settings.reset-to-zero.title"}}</span>
                <PixTooltip @id="reset-to-zero-info-tooltip" @position="top" @isWide={{true}}>
                  <:triggerElement>
                    <FaIcon
                      @icon="circle-info"
                      class="campaign-settings-content__tooltip-icon"
                      tabindex="0"
                      aria-describedby={{t "pages.campaign-settings.reset-to-zero.tooltip.aria-label" htmlSafe=true}}
                    />
                  </:triggerElement>
                  <:tooltip>
                    {{t "pages.campaign-settings.reset-to-zero.tooltip.text"}}
                  </:tooltip>
                </PixTooltip>
              </dt>
              <dd class="content-text campaign-settings-content__text">{{this.resetToZeroText}}</dd>
            </div>
          {{/if}}
        </div>
        <div class="campaign-settings-row">
          {{#if @campaign.isTypeAssessment}}
            <div class="campaign-settings-content">
              <dt class="label-text campaign-settings-content__label">
                {{t "pages.campaign-settings.target-profile.title"}}
              </dt>
              <dd class="content-text campaign-settings-content__text campaign-settings-content__text--with-tooltip">
                <span>{{@campaign.targetProfileName}} </span>
                <TargetProfileTooltip
                  class="campaign-settings-content__tooltip-icon"
                  @targetProfileDescription={{@campaign.targetProfileDescription}}
                  @hasStages={{@campaign.hasStages}}
                  @hasBadges={{@campaign.hasBadges}}
                  @targetProfileTubesCount={{@campaign.targetProfileTubesCount}}
                  @targetProfileThematicResultCount={{@campaign.targetProfileThematicResultCount}}
                />
              </dd>
            </div>
          {{/if}}
          {{#if @campaign.idPixLabel}}
            <div class="campaign-settings-content">
              <dt class="label-text campaign-settings-content__label">{{t
                  "pages.campaign-settings.external-user-id-label"
                }}
                <span class="help-text">({{t this.idPixTypeText}})</span></dt>

              <dd class="content-text campaign-settings-content__text">{{@campaign.idPixLabel}}</dd>
            </div>
          {{/if}}
          {{#if this.displayCampaignsRootUrl}}
            <div class="campaign-settings-content">
              <dt class="label-text campaign-settings-content__label">{{t "pages.campaign-settings.direct-link"}}</dt>
              <dd class="campaign-settings-content__clipboard">
                <span class="content-text campaign-settings-content__text">{{this.campaignsRootUrl}}</span>
                <CopyPasteButton
                  @clipBoardtext={{this.campaignsRootUrl}}
                  @successMessage={{t "pages.campaign.copy.link.success"}}
                  @defaultMessage={{t "pages.campaign.copy.link.default"}}
                />
              </dd>
            </div>
          {{/if}}
        </div>
        {{#if @campaign.isTypeAssessment}}
          <div class="campaign-settings-row">
            <div class="campaign-settings-content campaign-settings-content--single">
              <dt class="label-text campaign-settings-content__label">{{t
                  "pages.campaign-settings.personalised-test-title"
                }}</dt>
              <dd class="content-text campaign-settings-content__text">{{@campaign.title}}</dd>
            </div>
          </div>
        {{/if}}

        <div class="campaign-settings-row">
          <div class="campaign-settings-content campaign-settings-content--single">
            <dt class="label-text campaign-settings-content__label">{{t
                "pages.campaign-settings.landing-page-text"
              }}</dt>
            <dd class="content-text campaign-settings-content__text">
              <SafeMarkdownToHtml @markdown={{@campaign.customLandingPageText}} />
            </dd>
          </div>
        </div>
      </dl>

      {{#if this.displayCampaignActionsButtons}}
        <div class="campaign-settings-buttons">
          <PixButtonLink @route="authenticated.campaigns.update" @model={{@campaign.id}} @variant="secondary">
            {{t "pages.campaign-settings.actions.edit"}}
          </PixButtonLink>
          <PixButtonLink @route="authenticated.campaigns.new" @query={{this.queryForDuplicate}} @variant="secondary">
            {{t "pages.campaign-settings.actions.duplicate"}}
          </PixButtonLink>
          <PixButton @triggerAction={{fn this.archiveCampaign @campaign.id}} @variant="error">
            {{t "pages.campaign-settings.actions.archive"}}
          </PixButton>
        </div>
      {{/if}}
    </div>
  </template>
}
