import { PixButton } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import { not } from 'ember-truth-helpers';

export default class UserCertifications extends Component {
  get containerClasses() {
    let cssClasses = 'certification-dashboard-enrolment';

    if (!this.args.userEligibility.isCertifiable) {
      cssClasses += ' certification-dashboard-enrolment--not-certifiable';
    }

    return cssClasses;
  }

  <template>
    <section class={{this.containerClasses}}>
      <span class="certification-dashboard-enrolment__triangle" />
      {{#if @userEligibility.isCertifiable}}
        <h2 class="certification-dashboard-enrolment__title">
          {{t "pages.certifications-dashboard.enrolment-banner.certifiable.title"}}
        </h2>
        <p class="certification-dashboard-enrolment__description">
          {{t "pages.certifications-dashboard.enrolment-banner.certifiable.description"}}
        </p>
      {{else}}
        <h2 class="certification-dashboard-enrolment__title">
          {{t "pages.certifications-dashboard.enrolment-banner.not-certifiable.title"}}
        </h2>
        <p class="certification-dashboard-enrolment__description">
          {{t "pages.certifications-dashboard.enrolment-banner.not-certifiable.description"}}
        </p>
      {{/if}}
      <PixButton @isDisabled={{not @userEligibility.isCertifiable}} @variant="primary-bis">
        {{t "pages.certifications-dashboard.enrolment-banner.action"}}
      </PixButton>
    </section>
  </template>
}
