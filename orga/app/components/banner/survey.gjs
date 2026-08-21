import { PixNotificationAlert } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ENV from 'pix-orga/config/environment';

export default class SurveyBanner extends Component {
  @service router;
  @service currentDomain;

  get shouldDisplayBanner() {
    const routeNameWhereToDisplayBanner = [
      'authenticated.campaigns.loading',
      'authenticated.campaigns.list.my-campaigns',
      'authenticated.campaigns.list.all-campaigns',
      'authenticated.campaigns.campaign.loading',
      'authenticated.campaigns.campaign.activity',
      'authenticated.campaigns.campaign.assessment-results',
      'authenticated.campaigns.campaign.profile-results',
      'authenticated.campaigns.campaign.analysis',
      'authenticated.campaigns.campaign.settings',
      'authenticated.campaigns.update',
      'authenticated.campaigns.participant-assessment.loading',
      'authenticated.campaigns.participant-assessment.results',
      'authenticated.campaigns.participant-assessment.analysis',
      'authenticated.campaigns.participant-profile',
    ];

    return (
      ENV.APP.SURVEY_BANNER_ENABLED &&
      routeNameWhereToDisplayBanner.includes(this.router.currentRouteName) &&
      this.currentDomain.isFranceDomain
    );
  }

  <template>
    {{#if this.shouldDisplayBanner}}
      <PixNotificationAlert @type="information" @withIcon={{true}}>
        {{t
          "banners.survey.message"
          documentationLink=ENV.APP.SURVEY_LINK
          linkClasses="link link--banner link--bold link--underlined"
          htmlSafe=true
        }}
      </PixNotificationAlert>
    {{/if}}
  </template>
}
