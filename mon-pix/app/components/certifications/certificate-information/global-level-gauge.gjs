import { PixGauge } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class GlobalLevelGauge extends Component {
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
    <PixGauge
      @label={{this.gaugeLabel}}
      @reachedLevel={{@certificate.level}}
      @maxLevel="7"
      @stepLabels={{this.stepLabels}}
      @hideValues="true"
    />
  </template>
}
