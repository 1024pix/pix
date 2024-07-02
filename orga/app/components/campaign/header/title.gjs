import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';

import CopyPasteButton from '../../copy-paste-button';
import Breadcrumb from '../../ui/breadcrumb';
import CampaignType from '../detail/type';

export default class Header extends Component {
  @service intl;
  @service currentUser;

  get breadcrumbLinks() {
    return [
      {
        route: 'authenticated.campaigns',
        label: this.intl.t('navigation.main.campaigns'),
      },
      {
        route: 'authenticated.campaigns.campaign.activity',
        label: this.args.campaign.name,
        model: this.args.campaign.id,
      },
    ];
  }

  get labels() {
    return {
      ASSESSMENT: 'components.campaign.type.explanation.ASSESSMENT',
      PROFILES_COLLECTION: 'components.campaign.type.explanation.PROFILES_COLLECTION',
    };
  }

  get shouldShowMultipleSending() {
    return this.args.campaign.isTypeProfilesCollection || this.isMultipleSendingsForAssessmentEnabled;
  }

  get isMultipleSendingsForAssessmentEnabled() {
    return this.args.campaign.isTypeAssessment && this.currentUser.prescriber.enableMultipleSendingAssessment;
  }

  get multipleSendingText() {
    return this.args.campaign.multipleSendings
      ? this.intl.t('pages.campaign.multiple-sendings.status.enabled')
      : this.intl.t('pages.campaign.multiple-sendings.status.disabled');
  }

  <template>
    <header class="campaign-header-title">
      <Breadcrumb @links={{this.breadcrumbLinks}} class="campaign-header-title__breadcrumb" />
      <div class="campaign-header-title__informations">
        <h1 aria-label={{t "pages.campaign.name"}} class="campaign-header-title" title={{@campaign.name}}>
          <CampaignType
            @big={{true}}
            @labels={{this.labels}}
            @campaignType={{@campaign.type}}
            @hideLabel={{true}}
            class="campaign-header-title__type-icon"
          />
          <span class="campaign-header-title__name">{{@campaign.name}}</span>
        </h1>
        <dl class="campaign-header-title__details">
          <div class="campaign-header-title__detail-item hide-on-mobile">
            <dt class="label-text">
              {{t "pages.campaign.created-on"}}
            </dt>
            <dd>
              {{dayjsFormat @campaign.createdAt "DD/MM/YYYY" allow-empty=true}}
            </dd>
          </div>
          <div class="campaign-header-title__detail-item">
            <dt class="label-text">
              {{t "pages.campaign.created-by"}}
            </dt>
            <dd>
              {{@campaign.ownerFullName}}
            </dd>
          </div>

          {{#if this.shouldShowMultipleSending}}
            <div class="campaign-header-title__detail-item">
              <dt class="label-text">
                {{t "pages.campaign.multiple-sendings.title"}}
              </dt>
              <dd>
                {{this.multipleSendingText}}
              </dd>
            </div>
          {{/if}}
          <div class="campaign-header-title__detail-item">
            <dt class="label-text">
              {{t "pages.campaign.code"}}
            </dt>
            <dd class="campaign-header-title__campaign-code">
              <span>{{@campaign.code}}</span>
              <CopyPasteButton
                @clipBoardtext={{@campaign.code}}
                @successMessage={{t "pages.campaign.copy.code.success"}}
                @defaultMessage={{t "pages.campaign.copy.code.default"}}
                class="hide-on-mobile"
              />
            </dd>
          </div>
        </dl>
      </div>
    </header>
  </template>
}
