import Component from '@glimmer/component';

export default class Badge extends Component {

  get isCertifiableColor() {
    return this.args.badge.isCertifiable ? 'green' : 'yellow';
  }

  get isCertifiableText() {
    return this.args.badge.isCertifiable ? 'Certifiable' : 'Non certifiable';
  }

}
