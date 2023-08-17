import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import map from 'lodash/map';
import { statusToDisplayName } from 'pix-admin/models/session';

export default class ListItems extends Component {
  @tracked selectedCertificationCenterTypeOption = null;
  @tracked selectedSessionResultsSentToPrescriberOption = null;
  @tracked selectedSessionStatusOption = null;
  @tracked selectedSessionVersionOption = null;

  constructor() {
    super(...arguments);

    // "certification center type" filter
    this.certificationCenterTypeOptions = [
      { value: 'all', label: 'Tous' },
      { value: 'SCO', label: 'Sco' },
      { value: 'SUP', label: 'Sup' },
      { value: 'PRO', label: 'Pro' },
    ];
    this.selectedCertificationCenterTypeOption = this.getCertificationCenterTypeOptionByValue(
      this.args.certificationCenterType,
    );

    // session status
    this.sessionStatusOptions = [
      { value: 'all', label: 'Tous' },
      ...map(statusToDisplayName, (label, status) => ({ value: status, label })),
    ];
    this.selectedSessionStatusOption = this.getSessionStatusOptionByValue(this.args.sessionStatus);

    // session version
    this.sessionVersionOptions = [
      { value: 'all', label: 'Tous' },
      { value: '2', label: 'Sessions V2' },
      { value: '3', label: 'Sessions V3' },
    ];
    this.selectedSessionVersionOption = this.getSessionVersionOptionByValue();
  }

  @action
  selectCertificationCenterType(newValue) {
    this.selectedCertificationCenterTypeOption = this.getCertificationCenterTypeOptionByValue(newValue);
    this.args.onChangeCertificationCenterType(newValue);
  }

  getCertificationCenterTypeOptionByValue(value) {
    if (value) {
      return find(this.certificationCenterTypeOptions, { value });
    }
    return this.certificationCenterTypeOptions[0];
  }

  @action
  selectSessionStatus(newValue) {
    this.selectedSessionStatusOption = this.getSessionStatusOptionByValue(newValue);
    this.args.onChangeSessionStatus(newValue);
  }

  getSessionStatusOptionByValue(value) {
    if (value) {
      return find(this.sessionStatusOptions, { value });
    }
    return this.sessionStatusOptions[0];
  }

  @action
  selectSessionVersion(newValue) {
    this.selectedSessionVersionOption = this.getSessionVersionOptionByValue(newValue);
    this.args.onChangeSessionVersion(newValue);
  }

  getSessionVersionOptionByValue(value) {
    if (value) {
      return find(this.sessionVersionOptions, { value });
    }
    return this.sessionVersionOptions[0];
  }
}
