import Component from '@glimmer/component';
import startCase from 'lodash/startCase';

export default class CertificationBanner extends Component {

  get candidateFullName() {
    let fullName = '';
    if (this.args && this.args.certification) {
      const firstName = this.args.certification.get('firstName');
      const lastName = this.args.certification.get('lastName');
      fullName = `${startCase(firstName)} ${lastName.toUpperCase()}`;
    }
    return fullName;
  }
}
