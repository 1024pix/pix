import Component from '@glimmer/component';

export default class CertificationInfoField extends Component {

  isEdited = false;

  constructor() {
    super(...arguments);
    this.isEdited = this.args.edition;
  }

  get valueWithSuffix() {
    if (this.args.suffix) {
      return `${this.args.value} ${this.args.suffix}`;
    }
    return this.args.value;
  }

}
