import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ENV from 'pix-orga/config/environment';

export default class SurveyBanner extends Component {
  @service router;
  @service currentDomain;

  get shouldDisplayBanner() {
    const routeNameWhereToDisplayBanner = [
      'authenticated.campaigns.new',
      'authenticated.campaigns.loading',
      'authenticated.campaigns.combined-courses',
      'authenticated.campaigns.combined-course.loading',
      'authenticated.campaigns.combined-course.participations',
      'authenticated.campaigns.combined-course.participation-detail',
      'authenticated.campaigns.list.my-campaigns',
      'authenticated.campaigns.list.all-campaigns',
      'authenticated.campaigns.campaign.loading',
      'authenticated.campaigns.campaign.activity',
      'authenticated.campaigns.campaign.assessment-results',
      'authenticated.campaigns.campaign.profile-results',
      'authenticated.campaigns.campaign.analysis',
      'authenticated.campaigns.campaign.analysis.tubes',
      'authenticated.campaigns.campaign.analysis.competences',
      'authenticated.campaigns.campaign.settings',
      'authenticated.campaigns.update',
      'authenticated.catalogue.list',
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
