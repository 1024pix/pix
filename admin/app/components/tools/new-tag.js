import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import get from 'lodash/get';

export default class NewTag extends Component {
  @service store;
  @service notifications;

  @action
  async createNewTag(event) {
    event.preventDefault();
    let tag;

    try {
      tag = this.store.createRecord('tag', { name: this.tagName });
      await tag.save();

      this.notifications.success('Le tag a bien été créé !');
      document.getElementById('tagNameInput').value = '';
    } catch (response) {
      this.store.deleteRecord(tag);
      const status = get(response, 'errors[0].status');
      if (status === '412') {
        this.notifications.error('Ce tag existe déjà.');
      } else {
        this.notifications.error('Une erreur est survenue. Veuillez réessayer.');
      }
    }
  }

  @action
  onChangeTagName(event) {
    this.tagName = event.target.value;
  }
}
