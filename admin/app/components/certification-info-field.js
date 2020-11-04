import Component from '@glimmer/component';

export default class CertificationInfoField extends Component {

  get valueWithSuffix() {
    if (this.args.suffix) {
      return `${this.args.value} ${this.args.suffix}`;
    }
    return this.args.value;
  }

}
