import PixToastContainer from '@1024pix/pix-ui/components/pix-toast-container';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import AppLayout from 'mon-pix/components/global/app-layout';
import ModulixAppLayout from 'mon-pix/components/global/modulix-app-layout';

export default class ApplicationTemplate extends Component {
  @service router;

  get displayFullLayout() {
    return (
      ![
        'authenticated.certifications.information',
        'authenticated.certifications.results',
        'authenticated.certifications.start',
      ].includes(this.router.currentRouteName) &&
      (this.router.currentRouteName.startsWith('authenticated.') ||
        [
          'download-session-results',
          'shared-certification',
          'fill-in-campaign-code',
          'fill-in-certificate-verification-code',
          'error',
        ].includes(this.router.currentRouteName))
    );
  }

  get isFullWidth() {
    const isAccessPages =
      this.router.currentRouteName.startsWith('authentication.') ||
      this.router.currentRouteName.startsWith('inscription.') ||
      this.router.currentRouteName.startsWith('account-recovery.') ||
      [
        'not-connected',
        'terms-of-service',
        'reset-password',
        'password-reset-demand',
        'update-expired-password',
      ].includes(this.router.currentRouteName);

    const isEvaluationPages =
      this.router.currentRouteName.startsWith('assessments.') ||
      this.router.currentRouteName === 'campaigns.assessment.tutorial' ||
      this.router.currentRouteName.startsWith('organizations.');

    const isCertificationsPages = ['authenticated.certifications.information', 'companion'].includes(
      this.router.currentRouteName,
    );

    return isAccessPages || isEvaluationPages || isCertificationsPages;
  }

  get isModulix() {
    return (
      this.router.currentRouteName.startsWith('module.') ||
      this.router.currentRouteName === 'module-preview-existing' ||
      this.router.currentRouteName === 'module-preview'
    );
  }

  get isModulixPassage() {
    return this.router.currentRouteName.startsWith('module.') && this.router.currentRouteName.endsWith('passage');
  }

  <template>
    {{! template-lint-disable no-inline-styles }}
    {{pageTitle (t "navigation.pix")}}

    {{#in-element @controller.model.headElement insertBefore=null}}
      {{! template-lint-disable no-forbidden-elements }}
      <meta name="description" content={{t "application.description"}} />
    {{/in-element}}

    <div id="app">
      {{#if this.isModulix}}
        <ModulixAppLayout
          @banners={{@controller.model.informationBanner.banners}}
          @isModulixPassage={{this.isModulixPassage}}
        >
          {{outlet}}
        </ModulixAppLayout>
      {{else}}
        <AppLayout
          @displayFullLayout={{this.displayFullLayout}}
          @isFullWidth={{this.isFullWidth}}
          @banners={{@controller.model.informationBanner.banners}}
        >
          {{outlet}}
        </AppLayout>
      {{/if}}
      <!-- Preloading images -->
      <img src="/images/loader-white.svg" alt="{{t 'common.loading.default'}}" style="display: none" />
    </div>

    <PixToastContainer @closeButtonAriaLabel={{t "common.notifications.close-button.extra-information"}} />
  </template>
}
