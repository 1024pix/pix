import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { debounceTask } from 'ember-lifeline';
import { gt } from 'ember-truth-helpers';
import config from 'pix-admin/config/environment';
export default class AddOrganization extends Component {
  @service store;

  @tracked isModalOpened = false;
  @tracked organizations = [];
  @tracked search = null;

  @action
  openModal() {
    this.isModalOpened = true;
    this.updateOrganizationList();
  }

  @action
  closeModal() {
    this.isModalOpened = false;
  }

  @action
  updateSearch(event) {
    this.search = event.target.value;
    debounceTask(this, 'updateOrganizationList', config.pagination.debounce);
  }
  async updateOrganizationList() {
    console.log('updateOrganizationList', this.search);
    this.organizations = await this.store.query('organization', {
      filter: {
        name: this.search ? this.search.trim() : '',
        hideArchived: true,
      },
      page: {
        number: 1,
        size: 10,
      },
    });
  }

  <template>
    <PixButton @triggerAction={{this.openModal}}>coucou</PixButton>
    <PixModal @title="Ajouter des orga" @showModal={{this.isModalOpened}} @onCloseButtonClick={{this.closeModal}}>
      <:content>
        <PixInput {{on "input" this.updateSearch}} value={{this.search}}>
          <:label>{{t "common.fields.name"}}</:label>
        </PixInput>
        {{#if (gt this.organizations.length 0)}}
          <ul>
            {{#each this.organizations as |organization|}}
              <li>{{organization.name}} (id: {{organization.id}})</li>
            {{/each}}
          </ul>
        {{/if}}
      </:content>
      <:footer>
        <PixButton @variant="secondary" @triggerAction={{this.addOrganization}}>
          {{t "common.actions.close"}}
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
