import { PixBlock, PixButton, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import CopyPasteButton from '../../copy-paste-button';

export default class DownloadPdf extends Component {
  @service intl;
  @service session;
  @service fileSaver;
  @service currentDomain;
  @service locale;

  @tracked errorMessage = null;

  @action
  async downloadAttestation() {
    this.errorMessage = null;
    const certificationId = this.args.certificate.id;
    const lang = this.locale.currentLanguage;

    const url = `/api/attestation/${certificationId}?isFrenchDomainExtension=${this.currentDomain.isFranceDomain}&lang=${lang}`;

    const token = this.session.data.authenticated.access_token;
    try {
      await this.fileSaver.save({ url, token });
    } catch {
      this.errorMessage = this.intl.t('common.error');
    }
  }

  get downloadButtonLabel() {
    if (this.args.certificate.algorithmEngineVersion === 3) {
      return this.intl.t('pages.certificate.actions.download-certificate');
    }
    return this.intl.t('pages.certificate.actions.download-attestation');
  }

  <template>
    <section class="download-pdf">
      <h2 class="download-pdf__title">
        {{t "pages.certificate.verification-code.share"}}
      </h2>
      <PixButton @triggerAction={{this.downloadAttestation}} @iconBefore="download">
        {{this.downloadButtonLabel}}
      </PixButton>

      {{#if this.errorMessage}}
        <PixNotificationAlert @type="error" @withIcon={{true}}>
          <p>{{this.errorMessage}}</p>
        </PixNotificationAlert>
      {{/if}}

      <div class="download-pdf__verification-code">
        <p>{{t "pages.certificate.verification-code.information"}}</p>
        <PixBlock class="download-pdf-verification-code">
          <p>{{@certificate.verificationCode}}</p>
          <CopyPasteButton
            @clipBoardtext={{@certificate.verificationCode}}
            @successMessage={{t "pages.certificate.verification-code.copied"}}
            @defaultMessage={{t "pages.certificate.verification-code.copy"}}
          />
        </PixBlock>
      </div>
    </section>
  </template>
}
