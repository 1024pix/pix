import PixBanner from '@1024pix/pix-ui/components/pix-banner';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ENV from 'pix-orga/config/environment';

export default class InformationBanner extends Component {
  @service currentUser;
  @service router;
  @service dayjs;

  get displayCertificationBanner() {
    const timeToDisplay = ENV.APP.CERTIFICATION_BANNER_DISPLAY_DATES.split(' ');
    const actualMonth = this.dayjs.self().format('MM');
    return this.currentUser.isSCOManagingStudents && timeToDisplay.includes(actualMonth);
  }

  get year() {
    return this.dayjs.self().format('YYYY');
  }

  <template>
    {{#if this.displayCertificationBanner}}
      <PixBanner @type="warning">
        {{t
          "banners.certification.message"
          documentationLink="https://cloud.pix.fr/s/DEarDXyxFxM78ps"
          linkClasses="link link--banner link--bold link--underlined"
          htmlSafe=true
          year=this.year
        }}
      </PixBanner>
    {{/if}}
  </template>
}
