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
import SelectAttestation from './select-attestation';

export default class CombineCourseBluePrintForm extends Component {
  @service pixToast;
  @service store;
  @service intl;
  @service router;
  @tracked itemType = 'targetProfile';
  @tracked itemValue = '';
  @tracked blueprint;

  constructor() {
    super(...arguments);
    this.blueprint = this.store.createRecord('combined-course-blueprint');
    this.router.on('routeWillChange', () => {
      if (this.blueprint.hasDirtyAttributes && !this.blueprint.isSaving) {
        this.blueprint.unloadRecord();
      }
    });
  }

  @action
  async addItem(event) {
    event.preventDefault();
    try {
      if (this.itemType === 'targetProfile') {
        await this.addTargetProfile();
      } else {
        await this.addModule();
      }
    } catch (responseError) {
      this.#handleErrorForResource(this.itemType, responseError);
    } finally {
      this.itemValue = null;
      document.getElementsByName('itemType')[0].focus();
    }
  }

  async addTargetProfile() {
    const targetProfile = await this.store.findRecord('target-profile', this.itemValue);
    this.blueprint.content = [
      ...this.blueprint.content,
      {
        type: 'evaluation',
        value: Number(this.itemValue),
        label: targetProfile.internalName,
      },
    ];
  }

  async addModule() {
    const module = await this.store.findRecord('module', this.itemValue);

    this.blueprint.content = [
      ...this.blueprint.content,
      {
        type: 'module',
        value: module.id,
        shortId: module.shortId,
        label: module.title,
      },
    ];
  }

  #handleErrorForResource(resourceName, responseError) {
    if (responseError.errors?.some(({ status }) => status === '404')) {
      this.pixToast.sendErrorNotification({
        message: this.intl.t(`components.combined-course-blueprints.create.notifications.${resourceName}NotFound`),
      });
    } else {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.combined-course-blueprints.create.notifications.addItemError'),
      });
    }
  }

  @action
  async save() {
    try {
      await this.blueprint.save();
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.combined-course-blueprints.create.notifications.success'),
      });
      this.router.transitionTo('authenticated.combined-course-blueprints.list');
    } catch (responseError) {
      if (!responseError.errors) {
        return this.pixToast.sendErrorNotification({
          message: this.intl.t('components.combined-course-blueprints.create.notifications.error'),
        });
      }
      return responseError.errors
        .filter((error) => ['400', '404', '412'].includes(error.status))
        .forEach((error) => this.pixToast.sendErrorNotification({ message: error.detail }));
    }
  }

  @action
  setData(key, e) {
    this.blueprint[key] = e.target.value;
  }

  @action
  setAttestation(rewardId) {
    this.blueprint.rewardId = rewardId;
    this.blueprint.rewardType = 'ATTESTATION';
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

  @action
  removeRequirement({ type, value }) {
    this.blueprint.content = this.blueprint.content.filter((item) => item.value !== value || item.type !== type);
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
                <:label>{{t "components.combined-course-blueprints.labels.target-profile"}}</:label>
              </PixRadioButton>
              <PixRadioButton
                name="itemType"
                checked={{if (eq this.itemType "module") "checked"}}
                @value="module"
                {{on "change" this.setItemType}}
              >
                <:label>{{t "components.combined-course-blueprints.labels.module"}}</:label>
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
              {{t "components.combined-course-blueprints.labels.itemId"}}
            </:label>
          </PixInput>

          <PixButton @triggerAction={{this.addItem}} class="combined-course-page__button">{{t
              "components.combined-course-blueprints.create.addItemButton"
            }}</PixButton>
        </div>
        <hr class="combined-course-page__separator" />

        <PixInput
          @id="internalName"
          @value={{this.internalName}}
          @requiredLabel="Champ obligatoire"
          {{on "change" (fn this.setData "internalName")}}
          class="combined-course-page__input"
        >
          <:label>
            {{t "components.combined-course-blueprints.labels.internal-name"}}
          </:label>
        </PixInput>

        <PixInput
          @id="name"
          @value={{this.name}}
          @requiredLabel="Champ obligatoire"
          {{on "change" (fn this.setData "name")}}
          class="combined-course-page__input"
        >
          <:label>
            {{t "components.combined-course-blueprints.labels.name"}}
          </:label>
        </PixInput>

        <PixInput
          @id="illustration"
          @value={{this.illustration}}
          {{on "change" (fn this.setData "illustration")}}
          class="combined-course-page__input"
        >
          <:label>
            {{t "components.combined-course-blueprints.labels.illustration"}}

          </:label>
        </PixInput>

        <PixTextarea
          @id="description"
          @value={{this.description}}
          {{on "change" (fn this.setData "description")}}
          class="combined-course-page__input"
          rows="10"
        >
          <:label>
            {{t "components.combined-course-blueprints.labels.description"}}

          </:label>
        </PixTextarea>

        <SelectAttestation
          @attestations={{@attestations}}
          @value={{this.blueprint.rewardId}}
          @onChange={{this.setAttestation}}
        />

        <PixInput
          @id="surveyLink"
          @value={{this.surveyLink}}
          {{on "change" (fn this.setData "surveyLink")}}
          class="combined-course-page__input"
          rows="10"
        >
          <:label>
            {{t "components.combined-course-blueprints.labels.survey-link"}}
          </:label>
        </PixInput>
      </form>

      <div class="combined-course-page__items">
        <h2 class="combined-course-page__title">
          {{t "components.combined-course-blueprints.create.courseContent"}}</h2>

        {{#if (gt this.blueprint.content.length 0)}}
          <ul class="combined-course-page__list">
            {{#each this.blueprint.content as |item|}}
              <li>
                <RequirementTag @requirement={{item}} @onRemove={{this.removeRequirement}} />
              </li>
            {{/each}}
          </ul>
        {{else}}
          <p> {{t "components.combined-course-blueprints.create.contentFeedback"}}</p>
        {{/if}}

        <PixButton class="combined-course-page__button" @triggerAction={{this.save}} @variant="success">{{t
            "components.combined-course-blueprints.create.createButton"
          }}</PixButton>
      </div>
    </PixBlock>
  </template>
}
