import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { eq, gt } from 'ember-truth-helpers';
import PixFieldset from 'pix-admin/components/ui/pix-fieldset';

export default class CombineCourseForm extends Component {
  @service pixToast;

  @tracked combinedCourseItems = [];
  @tracked itemId = null;
  @tracked itemType = 'campaign';

  @action
  addItem(event) {
    event.preventDefault();
    if (this.itemType === 'campaign') {
      this.addCampaign();
    } else {
      this.addModule();
    }
  }

  @action
  deleteItem(itemToDelete) {
    console.log(itemToDelete.requirement_type);
    console.log(itemToDelete.data.targetProfileId);
    if (itemToDelete.requirement_type === 'campaignParticipations') {
      const index = this.combinedCourseItems.findIndex(
        (item) => item.data.targetProfileId.data === itemToDelete.data.targetProfileId.data,
      );
      // We need to keep this into two operations so re-render is triggered correctly
      this.combinedCourseItems.splice(index, 1);
      this.combinedCourseItems = [...this.combinedCourseItems];
    } else {
      const index = this.combinedCourseItems.findIndex(
        (item) => item.data.moduleId.data === itemToDelete.data.moduleId.data,
      );
      this.combinedCourseItems.splice(index, 1);
      this.combinedCourseItems = [...this.combinedCourseItems];
    }
  }

  addCampaign() {
    this.combinedCourseItems = [
      ...this.combinedCourseItems,
      {
        requirement_type: 'campaignParticipations',
        comparison: 'all',
        data: {
          targetProfileId: {
            data: this.itemId,
            comparison: 'equal',
          },
        },
      },
    ];
    this.itemId = null;
    console.log(this.combinedCourseItems);
  }

  addModule() {
    this.combinedCourseItems = [
      ...this.combinedCourseItems,
      {
        requirement_type: 'passages',
        comparison: 'all',
        data: {
          moduleId: {
            data: this.itemId,
            comparison: 'equal',
          },
        },
      },
    ];
    this.itemId = null;
  }

  @action
  async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(this.combinedCourseItems, null, 2));
      this.pixToast.sendSuccessNotification({
        message: 'Le JSON du parcours a été copié dans votre presse papier.',
      });
    } catch (e) {
      console.error(e);
      this.pixToast.sendErrorNotification({ message: "Le parcours n'a pas été copié dans votre presse papier." });
    }
  }

  getItemType(item) {
    return item.requirement_type === 'campaignParticipations' ? 'campaign' : 'module';
  }

  getItemValue(item) {
    return item.requirement_type === 'campaignParticipations'
      ? item.data.targetProfileId.data
      : item.data.moduleId.data;
  }

  getItemColor(item) {
    return item.requirement_type === 'campaignParticipations' ? 'purple' : 'blue';
  }

  setId = (e) => {
    this.itemId = e.target.value;
  };

  setItemType = (e) => {
    this.itemType = e.target.value;
  };

  getCombinedCourseItems() {
    return this.combinedCourseItems;
  }

  <template>
    <PixBlock @variant="admin" class="combined-course-page">
      <h1 class="combined-course-page__title">Combined course creator</h1>

      <form class="combined-course-page__form" {{on "submit" this.addItem}}>
        <PixFieldset>
          <:title>Choisissez le type d'élément à ajouter :</:title>
          <:content>
            <PixRadioButton
              name="itemType"
              @value="campaign"
              checked={{if (eq this.itemType "campaign") "checked"}}
              {{on "change" this.setItemType}}
            >
              <:label>Profil cible</:label>
            </PixRadioButton>
            <PixRadioButton
              name="itemType"
              checked={{if (eq this.itemType "module") "checked"}}
              @value="module"
              {{on "change" this.setItemType}}
            >
              <:label>Module</:label>
            </PixRadioButton>
          </:content>
        </PixFieldset>

        <PixInput
          @id="itemId"
          @value={{this.itemId}}
          @requiredLabel="Champ obligatoire"
          {{on "change" this.setId}}
          class="combined-course-page__input"
        >
          <:label>
            Identifiant
          </:label>
        </PixInput>

        <PixButton @type="submit" class="combined-course-page__button">Ajouter un item</PixButton>
      </form>

      <hr class="combined-course-page__separator" />

      <h2 class="combined-course-page__title">Contenu du parcours tout court</h2>

      {{#if (gt this.combinedCourseItems.length 0)}}
        <ul class="combined-course-page__list">
          {{#each this.combinedCourseItems as |item|}}
            <li class="combined-course-page__list-item"><PixTag @color={{this.getItemColor item}}>
                {{this.getItemType item}}
                -
                {{this.getItemValue item}}
              </PixTag>
              <PixIconButton
                @ariaLabel="Supprimer l'élément du parcours combiné"
                @iconName="delete"
                @triggerAction={{fn this.deleteItem item}}
              />
            </li>
          {{/each}}
        </ul>
      {{else}}
        <p>Votre parcours n'a aucun élément ajouté.</p>
      {{/if}}

      <PixButton class="combined-course-page__button" @triggerAction={{this.copyToClipboard}} @variant="success">Copier
        le JaSON</PixButton>
    </PixBlock>
  </template>
}
