import Component from '@glimmer/component';

export default class IsCertifiable extends Component {
  get isCertifiableNotAvailable() {
    return this.args.isCertifiable === null;
  }
}
