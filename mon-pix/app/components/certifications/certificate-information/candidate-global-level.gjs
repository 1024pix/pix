import { PixBlock, PixGauge, PixTag } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class candidateGlobalLevel extends Component {
  @service intl;

  get stepLabels() {
    return [
      this.intl.t('pages.certificate.global.labels.beginner'),
      this.intl.t('pages.certificate.global.labels.independent'),
      this.intl.t('pages.certificate.global.labels.advanced'),
      this.intl.t('pages.certificate.global.labels.expert'),
    ];
  }

  get gaugeLabel() {
    if (!this.args.certificate.level) {
      return this.intl.t('pages.certificate.global.progress-bar-explanation.pre-beginner-level');
    }

    return this.intl.t('pages.certificate.global.progress-bar-explanation.default', {
      level: this.args.certificate.level,
      globalLevelLabel: this.args.certificate.globalLevelLabel,
    });
  }

  <template>
    {{#if @isShareableContext}}
      <PixBlock class="candidate-global-level__shareable-progress-block">
        <h2 class="pix-title-xs">
          {{t "pages.certificate.global.progress-bar-explanation.shareable-progress-bar-title"}}
        </h2>
        <p class="pix-body-m">
          {{t "pages.certificate.global.progress-bar-explanation.shareable-progress-bar-description"}}
        </p>
        <PixGauge
          @label={{this.gaugeLabel}}
          @reachedLevel={{@certificate.level}}
          @maxLevel="7"
          @stepLabels={{this.stepLabels}}
          @hideValues="true"
        />
      </PixBlock>

      {{#if @certificate.globalLevelLabel}}
        <PixBlock class="v3-pix-plus-certificate__results-infos-block">
          <img src="/images/illustrations/user-certifications/certificate-magnifier.png" alt="" />
          <div class="v3-pix-plus-certificate__results-infos-details">
            <h3 class="v3-pix-plus-certificate__title">
              <span>{{t "pages.certificate.results.title"}}</span>
              <PixTag>{{@certificate.globalLevelLabel}}</PixTag>
            </h3>
            <p><strong>{{@certificate.globalSummaryLabel}}</strong></p>
            <p>{{@certificate.globalDescriptionLabel}}</p>
          </div>
        </PixBlock>
      {{/if}}
    {{else}}
      <div class="certification-score-information">
        <p>{{t "pages.certificate.certification-value.paragraphs.1"}}</p>
        <p>{{t "pages.certificate.certification-value.paragraphs.2"}}</p>
        <p class="certification-score-information--bold">{{t "pages.certificate.certification-value.paragraphs.3"}}</p>
      </div>

      <div class="hide-on-mobile">
        <PixGauge
          @label={{this.gaugeLabel}}
          @reachedLevel={{@certificate.level}}
          @maxLevel="7"
          @stepLabels={{this.stepLabels}}
          @hideValues="true"
        />
      </div>

      {{#if @certificate.globalLevelLabel}}
        <PixBlock class="candidate-global-information">
          <div class="candidate-global-information__level">
            <img
              class="candidate-global-information-level__image"
              src="/images/certificate/global-level-image.svg"
              alt=""
              role="presentation"
            />
            <div class="candidate-global-information-level__container">
              <h2>{{t "pages.certificate.global.labels.level"}}</h2>
              <PixTag>{{@certificate.globalLevelLabel}}</PixTag>
            </div>
          </div>
          <div>
            <p class="candidate-global-information--bold">{{@certificate.globalSummaryLabel}}</p>
            <p>{{@certificate.globalDescriptionLabel}}</p>
          </div>
        </PixBlock>
      {{/if}}
    {{/if}}
  </template>
}
