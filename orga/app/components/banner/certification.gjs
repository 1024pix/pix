import { PixNotificationAlert } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ENV from 'pix-orga/config/environment';

export default class InformationBanner extends Component {
  @service currentUser;
  @service router;
  @service intl;

  get displayCertificationBanner() {
    const timeToDisplay = ENV.APP.CERTIFICATION_BANNER_DISPLAY_DATES.split(' ');
    const actualMonth = this.intl.formatDate(new Date(), { month: '2-digit' });
    return this.currentUser.isSCOManagingStudents && timeToDisplay.includes(actualMonth);
  }

  get year() {
    return this.intl.formatDate(new Date(), { year: 'numeric' });
  }

  <template>
    {{#if this.displayCertificationBanner}}
      <PixNotificationAlert @type="warning" @withIcon={{true}}>
        {{t
          "banners.certification.message"
          documentationLink="https://cloud.pix.fr/s/EGzJMjHfkGdCG3d"
          linkClasses="link link--banner link--bold link--underlined"
          htmlSafe=true
          year=this.year
        }}
      </PixNotificationAlert>
    {{/if}}
  </template>
}
