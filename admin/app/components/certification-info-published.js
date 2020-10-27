import Component from '@glimmer/component';

export default class CertificationInfoPublished extends Component {

  classNameBindings = ['float:certification-informations__published-float'];

  get color() {
    const value = this.args.certification.isPublished;
    return value ? '#39B97A' : '#8090A5';
  }
}
