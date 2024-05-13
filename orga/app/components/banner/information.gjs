import PixBanner from '@1024pix/pix-ui/components/pix-banner';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ENV from 'pix-orga/config/environment';

export default class InformationBanner extends Component {
  @service currentUser;
  @service router;
  @service dayjs;

  get _isOnCertificationsPage() {
    return this.router.currentRouteName === 'authenticated.certifications';
  }

  get displayNewYearOrganizationLearnersImportBanner() {
    return (
      !this.currentUser.prescriber.areNewYearOrganizationLearnersImported &&
      this.currentUser.isSCOManagingStudents &&
      !this._isOnCertificationsPage
    );
  }

  get displayCertificationBanner() {
    const timeToDisplay = ENV.APP.CERTIFICATION_BANNER_DISPLAY_DATES.split(' ');
    const actualMonth = this.dayjs.self().format('MM');
    return this.currentUser.isSCOManagingStudents && timeToDisplay.includes(actualMonth);
  }

  <template>
    {{#if this.displayNewYearOrganizationLearnersImportBanner}}
      <NewYearBanner />
    {{else if this.displayCertificationBanner}}
      <CertificationBanner />
    {{/if}}
  </template>
}

const NewYearBanner = <template>
  <PixBanner @type="information">
    {{t
      "banners.import.message"
      documentationLink="https://view.genial.ly/62cd67b161c1e3001759e818?idSlide=e11f61b2-3047-4be3-9a4d-dd9e7cc698ba"
      linkClasses="link link--banner link--bold link--underlined"
      htmlSafe=true
    }}
  </PixBanner>
</template>;

const CertificationBanner = <template>
  <PixBanner @type="information">
    {{t
      "banners.certification.message"
      documentationLink="https://view.genial.ly/62cd67b161c1e3001759e818?idSlide=0f1b3413-7fef-4c97-b890-675c5bafbe93"
      linkClasses="link link--banner link--bold link--underlined"
      htmlSafe=true
    }}
  </PixBanner>
</template>;
