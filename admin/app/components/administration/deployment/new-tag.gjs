import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import get from 'lodash/get';

import AdministrationBlockLayout from '../block-layout';

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

  <template>
    <AdministrationBlockLayout @title="Créer un nouveau tag">
      <form {{on "submit" this.createNewTag}} class="tools__create-tag-form">
        <PixInput @id="tagNameInput" {{on "change" this.onChangeTagName}}>
          <:label>Nom du tag</:label>
        </PixInput>

        <PixButton @type="submit" @size="small">Créer le tag</PixButton>
      </form>
    </AdministrationBlockLayout>
  </template>
}
