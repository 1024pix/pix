import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';
import CopyPasteButton from 'mon-pix/components/copy-paste-button';
import { CERTIFICATE_STATUSES } from 'mon-pix/models/certificate-summary';

import Hexagon from './hexagon';
import Tags from './tags';

export default class ListItem extends Component {
  @service intl;
  @service session;
  @service fileSaver;
  @service currentDomain;
  @service locale;

  @tracked errorMessage = null;

  get isPublished() {
    return this.args.certificateSummary.status !== CERTIFICATE_STATUSES.WAITING_FOR_RESULTS;
  }

  get shouldDisplayFramework() {
    return !this.isPublished || this.args.certificateSummary.status === CERTIFICATE_STATUSES.CANCELLED;
  }

  get frameworkName() {
    return this.intl.t(`pages.certification-frameworks.${this.args.certificateSummary.certificationFramework}`);
  }

  get notObtainedCertificationWithComment() {
    return (
      (this.args.certificateSummary.isRejected || this.args.certificateSummary.isCancelled) &&
      this.args.certificateSummary.comment
    );
  }

  get downloadLabel() {
    if (this.args.certificateSummary.isDocumentAttestation) {
      return this.intl.t('pages.certifications-list.buttons.download-attestation');
    }
    return this.intl.t('pages.certifications-list.buttons.download-certificate');
  }

  @action
  async downloadAttestation() {
    this.errorMessage = null;
    const certificationId = this.args.certificateSummary.id;
    const lang = this.locale.currentLanguage;

    const url = `/api/attestation/${certificationId}?isFrenchDomainExtension=${this.currentDomain.isFranceDomain}&lang=${lang}`;

    const token = this.session.data.authenticated.access_token;
    try {
      await this.fileSaver.save({ url, token });
    } catch {
      this.errorMessage = this.intl.t('common.error');
    }
  }

  <template>
    <PixBlock class="certification-item" ...attributes>
      <div class="certification-item__details">
        <div>
          <Tags
            @status={{@certificateSummary.status}}
            @extraStatus={{@certificateSummary.extraCertificationStatus}}
            @framework={{@certificateSummary.certificationFramework}}
            @reachedMeshIndex={{@certificateSummary.reachedMeshIndex}}
          />
          {{#if this.shouldDisplayFramework}}
            <p data-testid="pw-certification-card-details-framework" class="info">
              <strong>{{this.frameworkName}}</strong>
            </p>
          {{/if}}
          <p data-testid="pw-certification-card-certification-center" class="info">
            {{t "pages.certifications-list.information.certification-center"}}
            {{@certificateSummary.certificationCenterName}}
          </p>
          <p data-testid="pw-certification-card-exam-date" class="info">
            {{t "pages.certifications-list.information.date"}}
            {{dayjsFormat @certificateSummary.certificationStartedAt "DD/MM/YYYY"}}
          </p>
        </div>
        <Hexagon
          @isValidated={{@certificateSummary.isValidated}}
          @pixScore={{@certificateSummary.pixScore}}
          @status={{@certificateSummary.status}}
          @extraStatus={{@certificateSummary.extraCertificationStatus}}
          @reachedMeshIndex={{@certificateSummary.reachedMeshIndex}}
          @framework={{@certificateSummary.certificationFramework}}
        />
      </div>
      {{#if this.notObtainedCertificationWithComment}}
        <p data-testid="pw-certification-card-comment" class="certification-item-comment">
          {{t "pages.certifications-list.comment"}}
          {{@certificateSummary.comment}}
        </p>
      {{/if}}

      {{#if @certificateSummary.isValidated}}
        {{#if this.errorMessage}}
          <PixNotificationAlert @type="error" @withIcon={{true}} class="certification-item-error">
            <p>{{this.errorMessage}}</p>
          </PixNotificationAlert>
        {{/if}}

        <div class="certification-item-verification-code">
          <span>{{t "pages.certificate.verification-code.title"}}&nbsp;: {{@certificateSummary.verificationCode}}</span>
          <div class="copy-paste">
            <CopyPasteButton
              class="pix-icon-button--xsmall"
              @clipBoardtext={{@certificateSummary.verificationCode}}
              @successMessage={{t "pages.certificate.verification-code.copied"}}
              @defaultMessage={{t "pages.certificate.verification-code.copy"}}
            />
          </div>
        </div>

        <ul class="certification-item-buttons">
          <li>
            <PixButtonLink
              @variant="secondary"
              @route="authenticated.user-certifications.get"
              @model={{@certificateSummary.id}}
              @iconBefore="eye"
            >
              {{t "pages.certifications-list.buttons.details"}}
            </PixButtonLink>
          </li>
          <li>
            <PixButton
              @triggerAction={{this.downloadAttestation}}
              @loadingColor="grey"
              @iconBefore="download"
              @variant="tertiary"
            >
              {{this.downloadLabel}}
            </PixButton>
          </li>
        </ul>
      {{/if}}
    </PixBlock>
  </template>
}
