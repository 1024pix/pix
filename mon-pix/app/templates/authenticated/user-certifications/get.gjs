import { PixBreadcrumb } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import V2Certificate from 'mon-pix/components/certifications/candidate-certificate/v2-certificate';
import V3CoreCertificate from 'mon-pix/components/certifications/candidate-certificate/v3-certificate';
import V3PixPlusCertificate from 'mon-pix/components/certifications/shareable-certificate/v3-pix-plus-certificate';

export default class UserCertificationPage extends Component {
  @service intl;

  get certificate() {
    return this.args.model;
  }

  get links() {
    return [
      {
        route: 'authenticated.user-certifications',
        label: this.intl.t('pages.certifications-list.title'),
      },
      {
        label: this.intl.t('pages.certificate.title'),
      },
    ];
  }

  <template>
    <main id="main" class="global-page-container" role="main">
      {{#if this.certificate.isV3}}
        <section class="global-page-header global-page-header__breadcrumb">
          <PixBreadcrumb @links={{this.links}} />

          <h1 class="global-page-header__title">
            {{this.certificate.title}}
          </h1>
        </section>
        {{#if this.certificate.hasPixPlusFramework}}
          <V3PixPlusCertificate @certificate={{this.certificate}} @context="user" />
        {{else}}
          <V3CoreCertificate @certificate={{this.certificate}} />
        {{/if}}
      {{else}}
        <V2Certificate @model={{this.certificate}} />
      {{/if}}
    </main>
  </template>
}
