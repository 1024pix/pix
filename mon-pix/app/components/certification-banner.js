import Component from '@glimmer/component';
import startCase from 'lodash/startCase';

export default class CertificationBanner extends Component {

  get candidateFullName() {
    let fullName = '';
    if (this.args && this.args.certification) {
      this.firstName = this.args.certification.get('firstName');
      this.lastName = this.args.certification.get('lastName');
      fullName = `${startCase(this.firstName)} ${this.lastName.toUpperCase()}`;
    }
    return fullName;
  }
}
