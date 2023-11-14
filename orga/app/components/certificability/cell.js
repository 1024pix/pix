import Component from '@glimmer/component';

export default class Cell extends Component {
  get displayCertificabilityDate() {
    return !this.args.hideCertifiableDate && this.args.isCertifiable !== null;
  }
}
