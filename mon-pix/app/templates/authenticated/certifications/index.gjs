import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import CertificationEligibility from 'mon-pix/components/certifications/dashboard/eligibility';
import EnrolmentBanner from 'mon-pix/components/certifications/dashboard/enrolment-banner';
import UserCertifications from 'mon-pix/components/certifications/dashboard/user-certifications';

export default class CertificationPage extends Component {
  get isUserCertifiableWithCertifications() {
    const { isCertifiable } = this.args.model.userEligibility;
    const hasSomeCertification = this.args.model.certificationsSummaries.length;

    return isCertifiable && hasSomeCertification;
  }

  <template>
    {{pageTitle (t "pages.certifications-dashboard.title")}}

    <main id="main" role="main">
      <h1 class="sr-only">{{t "pages.certifications-dashboard.title"}}</h1>

      <EnrolmentBanner @userEligibility={{@model.userEligibility}} />

      {{#if this.isUserCertifiableWithCertifications}}
        <UserCertifications @certificationsSummaries={{@model.certificationsSummaries}} />
        <CertificationEligibility @userIsCertifiable={{@model.userEligibility}} />
      {{else}}
        <CertificationEligibility @userIsCertifiable={{@model.userEligibility}} />
        <UserCertifications @certificationsSummaries={{@model.certificationsSummaries}} />
      {{/if}}
    </main>
  </template>
}
