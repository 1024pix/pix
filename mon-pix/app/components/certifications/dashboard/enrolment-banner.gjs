import { PixBlock, PixButton, PixModal } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { not } from 'ember-truth-helpers';
import CertificationJoiner from 'mon-pix/components/certification-joiner';

export default class UserCertifications extends Component {
  @tracked isModalOpen = false;

  get containerClasses() {
    let cssClasses = 'certification-dashboard-enrolment';

    if (!this.args.userEligibility.isCertifiable) {
      cssClasses += ' certification-dashboard-enrolment--not-certifiable';
    }

    return cssClasses;
  }

  get cleaImageUrl() {
    return this.args.userEligibility.doubleCertificationEligibility?.imageUrl;
  }

  @action
  toggleModalVisibility() {
    this.isModalOpen = !this.isModalOpen;
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

      <PixButton
        @isDisabled={{not @userEligibility.isCertifiable}}
        @variant="primary-bis"
        @triggerAction={{this.toggleModalVisibility}}
      >
        {{t "pages.certifications-dashboard.enrolment-banner.action"}}
      </PixButton>

      <PixModal
        @title={{t "pages.certifications-dashboard.modal.title"}}
        @subtitle={{t "pages.certifications-dashboard.modal.sub-title"}}
        @showModal={{this.isModalOpen}}
        @onCloseButtonClick={{this.toggleModalVisibility}}
        @variant="certif"
      >
        <:content>
          <CertificationJoiner @hideTitle={{true}} />
        </:content>
      </PixModal>
    </section>
    {{#if @userEligibility.isCleaEligible}}
      <PixBlock class="certification-dashboard-enrolment-clea" @variant="certif">
        <h2 class="certification-dashboard-enrolment-clea--title">
          {{t "pages.certifications-dashboard.enrolment-banner.clea.title"}}
        </h2>
        <p class="certification-dashboard-enrolment-clea--text">
          {{t "pages.certifications-dashboard.enrolment-banner.clea.text"}}
        </p>
        <img class="certification-dashboard-enrolment-clea--image" src={{this.cleaImageUrl}} alt="" />
      </PixBlock>
    {{/if}}
  </template>
}
