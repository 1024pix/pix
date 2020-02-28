import { classNames, classNameBindings } from '@ember-decorators/component';
import { computed } from '@ember/object';
import Component from '@glimmer/component';

@classNames('certification-info-published')
@classNameBindings('float:certification-info-published-float')
export default class CertificationInfoPublished extends Component {
  @computed('record.isPublished')
  get color() {
    const value = this.get('record.isPublished');
    return value ? '#39B97A' : '#8090A5';
  }
}
