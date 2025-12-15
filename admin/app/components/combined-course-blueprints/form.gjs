import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq, gt } from 'ember-truth-helpers';
import PixFieldset from 'pix-admin/components/ui/pix-fieldset';

import RequirementTag from '../common/combined-courses/requirement-tag';

export default class CombineCourseBluePrintForm extends Component {
  @service pixToast;
  @service store;
  @tracked itemType = 'targetProfile';
  @tracked itemValue = '';
  @tracked blueprint;

  constructor() {
    super(...arguments);
    this.blueprint = this.store.createRecord('combined-course-blueprint');
  }
  @action
  addItem(event) {
    event.preventDefault();
    if (this.itemType === 'targetProfile') {
      this.addTargetProfile();
    } else {
      this.addModule();
    }

    document.getElementsByName('itemType')[0].focus();
  }

  addTargetProfile() {
    this.blueprint.content = [
      ...this.blueprint.content,
      {
        type: 'evaluation',
        value: Number(this.itemValue),
      },
    ];

    this.itemValue = null;
  }

  addModule() {
    this.blueprint.content = [
      ...this.blueprint.content,
      {
        type: 'module',
        value: this.itemValue,
      },
    ];

    this.itemValue = null;
  }

  @action
  async save() {
    this.blueprint.save();
  }

  @action
  async downloadCSV() {
    try {
      const jsonParsed = JSON.stringify({
        name: this.name,
        description: this.description,
        illustration: this.illustration,
        combinedCourseContent: this.combinedCourseItems,
      });
      const exportedData = [
        ['Identifiant des organisations*', 'Identifiant du createur des campagnes*', 'Json configuration for quest*'],
        [this.organizationIds, this.creatorId, jsonParsed],
      ];

      const csvContent = exportedData
        .map((line) => line.map((data) => `"${data.replaceAll('"', '""').replaceAll('\\""', '\\"')}"`).join(';'))
        .join('\n');

      const exportLink = document.createElement('a');
      exportLink.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
      exportLink.setAttribute('download', `${this.name}.csv`);
      exportLink.click();

      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.combined-course-blueprints.create.notifications.success'),
      });
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.combined-course-blueprints.create.notifications.error'),
      });
    }
  }

  @action
  setData(key, e) {
    this.blueprint[key] = e.target.value;
  }

  @action
  setItemType(e) {
    this.itemType = e.target.value;
  }

  @action
  setItemValue(e) {
    this.itemValue = e.target.value;
  }

  @action
  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.setItemValue(event);
      this.addItem(event);
    }
  }

  <template>
    <PixBlock @variant="admin" class="combined-course-page">

      <form class="combined-course-page__form">
        <h1 class="combined-course-page__title"> {{t "components.combined-course-blueprints.create.title"}}</h1>

        <PixFieldset>
          <:title>
            {{t "components.combined-course-blueprints.create.fieldsetElement"}}
          </:title>
          <:content>
            <div class="combined-course-page__fieldset">
              <PixRadioButton
                name="itemType"
                @value="targetProfile"
                checked={{if (eq this.itemType "targetProfile") "checked"}}
                {{on "change" this.setItemType}}
              >
                <:label>{{t "components.combined-course-blueprints.create.labels.target-profile"}}</:label>
              </PixRadioButton>
              <PixRadioButton
                name="itemType"
                checked={{if (eq this.itemType "module") "checked"}}
                @value="module"
                {{on "change" this.setItemType}}
              >
                <:label>{{t "components.combined-course-blueprints.create.labels.module"}}</:label>
              </PixRadioButton>
            </div>
          </:content>
        </PixFieldset>

        <div class="combined-course-page__form-addItem">
          <PixInput
            @id="itemId"
            @value={{this.itemValue}}
            @requiredLabel="Champ obligatoire"
            {{on "change" this.setItemValue}}
            {{on "keyup" this.handleKeyPress}}
            class="combined-course-page__input"
          >
            <:label>
              {{t "components.combined-course-blueprints.create.labels.itemId"}}
            </:label>
          </PixInput>

          <PixButton @triggerAction={{this.addItem}} class="combined-course-page__button">{{t
              "components.combined-course-blueprints.create.addItemButton"
            }}</PixButton>
        </div>
        <hr class="combined-course-page__separator" />
        <PixInput
          @id="name"
          @value={{this.name}}
          @requiredLabel="Champ obligatoire"
          {{on "change" (fn this.setData "name")}}
          class="combined-course-page__input"
        >
          <:label>
            {{t "components.combined-course-blueprints.create.labels.name"}}
          </:label>
        </PixInput>

        <PixInput
          @id="internalName"
          @value={{this.internalName}}
          @requiredLabel="Champ obligatoire"
          {{on "change" (fn this.setData "internalName")}}
          class="combined-course-page__input"
        >
          <:label>
            {{t "components.combined-course-blueprints.create.labels.internal-name"}}
          </:label>
        </PixInput>

        <PixInput
          @id="illustration"
          @value={{this.illustration}}
          @requiredLabel="Champ obligatoire"
          {{on "change" (fn this.setData "illustration")}}
          class="combined-course-page__input"
        >
          <:label>
            {{t "components.combined-course-blueprints.create.labels.illustration"}}

          </:label>
        </PixInput>

        <PixTextarea
          @id="description"
          @value={{this.description}}
          @requiredLabel="Champ obligatoire"
          {{on "change" (fn this.setData "description")}}
          class="combined-course-page__input"
          rows="10"
        >
          <:label>
            {{t "components.combined-course-blueprints.create.labels.description"}}

          </:label>
        </PixTextarea>

      </form>

      <div class="combined-course-page__items">
        <h2 class="combined-course-page__title">
          {{t "components.combined-course-blueprints.create.courseContent"}}</h2>

        {{#if (gt this.blueprint.content.length 0)}}
          <ul class="combined-course-page__list">
            {{#each this.blueprint.content as |item|}}
              <li><RequirementTag @type={{item.type}} @value={{item.value}} />
              </li>
            {{/each}}
          </ul>
        {{else}}
          <p> {{t "components.combined-course-blueprints.create.contentFeedback"}}</p>
        {{/if}}

        <PixButton class="combined-course-page__button" @triggerAction={{this.save}} @variant="success">{{t
            "components.combined-course-blueprints.create.downloadButton"
          }}</PixButton>
      </div>
    </PixBlock>
  </template>
}
