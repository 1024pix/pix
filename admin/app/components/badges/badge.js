import Component from '@glimmer/component';

export default class Badge extends Component {

  get isCertifiableColor() {
    return this.args.model.isCertifiable ? 'green' : 'yellow';
  }

  get isCertifiableText() {
    return this.args.model.isCertifiable ? 'Certifiable' : 'Non certifiable';
  }

}
