import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { CERTIFICATE_TYPES } from 'mon-pix/models/certificate-summary';

export default class Hexagon extends Component {
  get hasCoreScope() {
    return ['CORE', 'CLEA'].includes(this.args.framework);
  }

  get isPixPlusV3() {
    return !this.hasCoreScope && this.args.certificateType === CERTIFICATE_TYPES.CERTIFICATE;
  }

  get classNames() {
    const classes = ['certification-item__hexagon'];

    if (this.isPixPlusV3 && this.args.reachedMeshIndex != null) {
      classes.push('certification-item__hexagon--pix-plus-validated');
    }

    if (this.isPixPlusV3 && this.args.reachedMeshIndex === null) {
      classes.push('certification-item__hexagon--pix-plus-not-validated');
    }

    return classes.join(' ');
  }

  get score() {
    return this.args.isValidated ? this.args.pixScore : '-';
  }

  <template>
    <div data-testid="pw-certification-card-result" class={{this.classNames}}>
      <strong class="score">{{this.score}}</strong>
      <span class="pix">{{t "common.pix"}}</span>
    </div>
  </template>
}
