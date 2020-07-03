import Component from '@ember/component';
import { computed } from '@ember/object';

export default class CertificationInfoPublished extends Component {

  classNames = ['certification-informations__published'];
  classNameBindings = ['float:certification-informations__published-float'];

  @computed('record.isPublished')
  get color() {
    const value = this.record.isPublished;
    return value ? '#39B97A' : '#8090A5';
  }
}
