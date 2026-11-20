import { PixStepper, PixTag } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { and } from 'ember-truth-helpers';
import { CERTIFICATE_TYPES } from 'mon-pix/models/certificate-summary';

import Hexagon from '../../user-certifications/list-item/hexagon';
import CertificateHero from './certificate-hero';
import ResultsInfos from './results-infos';

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
      `pages.certifications-dashboard.user-certifications.meshes.${this.args.certificate.certificationFramework}.${this.args.certificate.level}`,
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
      <CertificateHero
        @certificate={{@certificate}}
        @subTitle={{this.certificationSubTitle}}
        @isUserCertificate={{this.isUserCertificate}}
      >
        <:stepper>
          {{#if this.isCandidateEduAdmissible}}
            <PixStepper
              class="v3-pix-plus-certificate__stepper"
              @steps={{this.steps}}
              @currentStep={{this.eduCurrentStep}}
            />
          {{/if}}
        </:stepper>
        <:score>
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
        </:score>
      </CertificateHero>

      {{#if this.isCandidateEduAdmissible}}
        <ResultsInfos @summary={{this.eduResultsSubTitle}}>
          <:description>{{this.eduResultsInfos}}</:description>
        </ResultsInfos>
      {{else if (and @certificate.globalSummaryLabel @certificate.globalDescriptionLabel)}}
        <ResultsInfos @summary={{@certificate.globalSummaryLabel}}>
          <:tag>
            <PixTag class="v3-pix-plus-certificate__mesh-level-tag" @color="yellow">{{this.reachedMeshLabel}}</PixTag>
          </:tag>
          <:description>{{@certificate.globalDescriptionLabel}}</:description>
        </ResultsInfos>
      {{/if}}
    </section>
  </template>
}
