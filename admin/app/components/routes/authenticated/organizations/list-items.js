import { computed } from '@ember/object';
import Component from '@glimmer/component';

export default class ListItems extends Component {

  @computed('name')
  get nameValue() {
    return this.name;
  }

  @computed('type')
  get typeValue() {
    return this.type;
  }

  @computed('code')
  get codeValue() {
    return this.code;
  }

  @computed('externalId')
  get externalIdValue() {
    return this.externalId;
  }
}
