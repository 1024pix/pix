import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { fn } from '@ember/helper';
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
  @tracked organizationOptions = [];
  @tracked selectedItems = [];
  @tracked search = null;
  @tracked creatorId = null;
  @service currentUser;
  constructor() {
    super(...arguments);
    this.creatorId = this.currentUser.adminMember.id;
  }
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
  updateCreatorId(event) {
    this.creatorId = event.target.value;
  }
  @action
  removeItem(item) {
    this.selectedItems = [...this.selectedItems.filter(({ value }) => value !== item.value)];
  }

  @action
  updateSearch(search) {
    this.search = search;
    debounceTask(this, 'updateOrganizationList', config.pagination.debounce);
  }
  async updateOrganizationList() {
    this.organizationOptions = [];
    const organizations = await this.store.query('organization', {
      filter: {
        name: this.search ? this.search.trim() : '',
        hideArchived: true,
      },
      page: {
        number: 1,
        size: 10,
      },
    });

    for (const option of organizations) {
      this.organizationOptions = [...this.organizationOptions, { label: option.name, value: parseInt(option.id) }];
    }
  }
  @action
  changeHandler(selectedId) {
    const item = this.organizationOptions.find(({ value }) => value === selectedId);
    if (item) {
      this.selectedItems = [...this.selectedItems, item];
    }
  }

  @action
  addOrganization() {
    console.log(this.selectedItems, this.creatorId);
  }

  <template>
    <PixIconButton
      @triggerAction={{this.openModal}}
      @iconName="studyLesson"
      size="small"
      aria-label="Créer un parcours"
    />
    <PixModal
      @title="Créer un parcours combiné"
      @showModal={{this.isModalOpened}}
      @onCloseButtonClick={{this.closeModal}}
    >
      <:content>
        <div>
          <PixInput @value={{this.creatorId}} {{on "input" this.updateCreatorId}}>
            <:label>Identifiant du créateur</:label>
          </PixInput>
        </div>
        <div>
          <PixSelect
            class="organization-picker"
            @placeholder="Ajouter une organisation"
            @hideDefaultOption={{true}}
            @onChange={{this.changeHandler}}
            @isSearchable={{true}}
            @searchLabel="organisations"
            @searchPlaceholder="Rechercher une organisation"
            @emptySearchMessage="Pas de résultat"
            @onSearch={{this.updateSearch}}
            @options={{this.organizationOptions}}
            @subLabel="sélectionnez les organisations qui auront accès au parcours"
          >
            <:label>Organisations</:label>
          </PixSelect>

          {{#if (gt this.selectedItems.length 0)}}
            <ul class="combined-course-organizations">
              {{#each this.selectedItems as |item|}}
                <li>
                  <PixTag>
                    {{item.label}}
                    <PixIconButton
                      @size="small"
                      @ariaLabel="L'action du bouton"
                      @iconName="close"
                      @triggerAction={{fn this.removeItem item}}
                    />

                  </PixTag>
                </li>
              {{/each}}
            </ul>
          {{/if}}
        </div>
      </:content>
      <:footer>
        <PixButton @variant="secondary" @triggerAction={{this.addOrganization}}>
          Créer le parcours combiné
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
