import { computed } from '@ember/object';
import Component from '@glimmer/component';

export default class ListItems extends Component {

  @computed('id')
  get idValue() {
    return this.id;
  }

  @computed('name')
  get nameValue() {
    return this.name;
  }

  @computed('type')
  get typeValue() {
    return this.type;
  }

  @computed('externalId')
  get externalIdValue() {
    return this.externalId;
  }

}
