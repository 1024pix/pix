import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { statusToDisplayName } from 'pix-admin/models/session';
import map from 'lodash/map';

export default class ListItems extends Component {
  @tracked selectedCertificationCenterTypeOption = null;
  @tracked selectedSessionResultsSentToPrescriberOption = null;
  @tracked selectedSessionStatusOption = null;

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
      this.args.certificationCenterType
    );

    // session status
    this.sessionStatusOptions = [
      { value: 'all', label: 'Tous' },
      ...map(statusToDisplayName, (label, status) => ({ value: status, label })),
    ];
    this.selectedSessionStatusOption = this.getSessionStatusOptionByValue(this.args.sessionStatus);

    // "certification center type" filter
    this.sessionResultsSentToPrescriberOptions = [
      { value: 'all', label: 'Tous' },
      { value: 'true', label: 'Résultats diffusés' },
      { value: 'false', label: 'Résultats non diffusés' },
    ];
    this.selectedSessionResultsSentToPrescriberOption = this.getSessionResultsSentToPrescriberOptionByValue(
      this.args.resultsSentToPrescriberAt
    );
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
  selectSessionResultsSentToPrescriber(newValue) {
    this.selectedSessionResultsSentToPrescriberOption = this.getSessionResultsSentToPrescriberOptionByValue(newValue);
    this.args.onChangeSessionResultsSent(newValue);
  }

  getSessionResultsSentToPrescriberOptionByValue(value) {
    if (value) {
      return find(this.sessionResultsSentToPrescriberOptions, { value });
    }
    return this.sessionResultsSentToPrescriberOptions[0];
  }
}
