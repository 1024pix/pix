import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixStepper from '@1024pix/pix-ui/components/pix-stepper';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';
import { and } from 'ember-truth-helpers';
import { CERTIFICATE_TYPES } from 'mon-pix/models/certificate-summary';

import Hexagon from '../../user-certifications/list-item/hexagon';
import DownloadPdf from '../certificate-information/download-pdf';

const EDU_STEPS = {
  ADMISSIBLE: 2,
  FINAL: 3,
};

export default class PixPlusCertificate extends Component {
  @service intl;

  @tracked eduCurrentStep = this.isCandidateEduAdmissible ? EDU_STEPS.ADMISSIBLE : EDU_STEPS.FINAL;

  get isCandidateEduAdmissible() {
    return this.args.certificate.certificationFramework.includes('EDU') && this.args.certificate.level === 'ADMISSIBLE';
  }

  get isUserCertificate() {
    return this.args.context === 'user';
  }

  get contextKey() {
    return this.isUserCertificate ? 'user' : 'candidate';
  }

  get certificationFrameworkLabel() {
    return this.intl.t(`pages.certification-frameworks.${this.args.certificate.certificationFramework}`);
  }

  get reachedMeshLabel() {
    return this.intl.t(
      `pages.user-certifications.meshes.${this.args.certificate.certificationFramework}.${this.args.certificate.level}`,
    );
  }

  get certificationSubTitle() {
    if (this.isCandidateEduAdmissible) {
      return this.intl.t(`pages.certificate.frameworks.EDU.sub-title.admissible.${this.contextKey}`);
    }
    return this.intl.t(`pages.certificate.obtained-certification.${this.contextKey}`, {
      globalLevelLabel: this.reachedMeshLabel,
      frameworkLabel: this.certificationFrameworkLabel,
    });
  }

  get eduResultsInfos() {
    return this.intl.t(`pages.certificate.frameworks.EDU.results-infos.${this.contextKey}`, { htmlSafe: true });
  }

  get eduResultsSubTitle() {
    return this.intl.t(`pages.certificate.frameworks.EDU.results-sub-title.${this.contextKey}`);
  }

  get steps() {
    return [
      { title: this.intl.t('pages.certificate.frameworks.EDU.steps.1') },
      { title: this.intl.t('pages.certificate.frameworks.EDU.steps.2', { htmlSafe: true }) },
      { title: this.intl.t('pages.certificate.frameworks.EDU.steps.3') },
    ];
  }

  <template>
    <section class="v3-shareable-certificate">
      <div class="v3-pix-plus-certificate__hero">
        <PixBlock class="v3-pix-plus-certificate__infos-block">
          <div>
            {{#if this.isUserCertificate}}
              <h2 class="v3-pix-plus-certificate__title" data-testid="pw-candidate-certificate-global-level">
                <strong>{{t "pages.certificate.congratulations"}}</strong>
                {{this.certificationSubTitle}}
              </h2>
            {{else}}
              <PixTag @color="green" class="v3-pix-plus-certificate__valid-tag">
                <PixIcon @name="check" />
                {{t "pages.certificate.valid-status"}}
              </PixTag>

              <h2 class="v3-pix-plus-certificate__title" data-testid="pw-candidate-certificate-global-level">
                <strong>{{t "pages.certificate.valid-status"}}</strong>
                {{this.certificationSubTitle}}
              </h2>
            {{/if}}

            {{#if this.isCandidateEduAdmissible}}
              <PixStepper
                class="v3-pix-plus-certificate__stepper"
                @steps={{this.steps}}
                @currentStep={{this.eduCurrentStep}}
              />
            {{/if}}

            <div class="v3-pix-plus-certificate__details">
              <p>
                <strong>
                  {{t "pages.certificate.candidate"}}
                  {{@certificate.firstName}}
                  {{@certificate.lastName}}
                </strong><br />
                {{t
                  "pages.certificate.candidate-birth-complete"
                  birthdate=(dayjsFormat @certificate.birthdate "DD/MM/YYYY")
                  birthplace=@certificate.birthplace
                }}
              </p>
              <dl>
                <dt><strong>{{t "pages.certificate.certification-center"}}</strong></dt>
                <dd><strong>{{@certificate.certificationCenter}}</strong></dd>

                <dt>{{t "pages.certificate.certification-date"}}</dt>
                <dd>{{dayjsFormat @certificate.certificationDate "DD/MM/YYYY"}}</dd>

                <dt>{{t "pages.certificate.delivered-at"}}</dt>
                <dd>{{dayjsFormat @certificate.deliveredAt "DD/MM/YYYY"}}</dd>
              </dl>
            </div>
          </div>
          <div class="v3-pix-plus-certificate__score">
            {{#if this.isCandidateEduAdmissible}}
              <Hexagon
                @framework={{@certificate.certificationFramework}}
                @certificateType={{CERTIFICATE_TYPES.CERTIFICATE}}
                @reachedMeshLevel={{@certificate.level}}
              />
              <PixTag @color="green">{{this.reachedMeshLabel}}</PixTag>
            {{else}}
              <Hexagon @badgeUrl={{@certificate.badgeUrl}} />
            {{/if}}
          </div>
        </PixBlock>

        {{#if this.isUserCertificate}}
          <DownloadPdf @certificate={{@certificate}} />
        {{/if}}
      </div>

      {{#if this.isCandidateEduAdmissible}}
        <PixBlock class="v3-pix-plus-certificate__results-infos-block">
          <img src="/images/illustrations/user-certifications/certificate-magnifier.png" alt="" />
          <div class="v3-pix-plus-certificate__results-infos-details">
            <h3 class="v3-pix-plus-certificate__title">{{t "pages.certificate.results.title"}}</h3>
            <p><strong>{{this.eduResultsSubTitle}}</strong></p>
            {{this.eduResultsInfos}}
          </div>
        </PixBlock>
      {{else if (and @certificate.globalSummaryLabel @certificate.globalDescriptionLabel)}}
        <PixBlock class="v3-pix-plus-certificate__results-infos-block">
          <img src="/images/illustrations/user-certifications/certificate-magnifier.png" alt="" />
          <div class="v3-pix-plus-certificate__results-infos-details">
            <h3 class="v3-pix-plus-certificate__title">{{t "pages.certificate.results.title"}}</h3>
            <p><strong>{{@certificate.globalSummaryLabel}}</strong></p>
            {{@certificate.globalDescriptionLabel}}
          </div>
        </PixBlock>
      {{/if}}
    </section>
  </template>
}
