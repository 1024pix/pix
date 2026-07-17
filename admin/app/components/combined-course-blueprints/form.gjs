import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { and, eq, gt, not, or } from 'ember-truth-helpers';

import Card from '../card';
import TubesSelection from '../common/tubes-selection';
import SelectAttestation from './select-attestation';

export default class CombinedCourseBlueprintForm extends Component {
  @service pixToast;
  @service store;
  @service intl;
  @service router;
  @tracked itemType = 'evaluation';
  @tracked itemValue = '';
  @tracked blueprint;
  @tracked selectedTubes;
  @tracked itemAddDisabled = true;
  @tracked itemToAdd = null;

  constructor() {
    super(...arguments);
    this.blueprint = this.args.model.blueprint ?? this.store.createRecord('combined-course-blueprint');
    this.router.on('routeWillChange', () => {
      if (this.blueprint.hasDirtyAttributes && !this.blueprint.isSaving) {
        this.blueprint.unloadRecord();
      }
    });
  }

  @action
  addItem(event) {
    event.preventDefault();

    this.addToContent();

    this.itemValue = null;
    document.getElementsByName('itemType')[0].focus();
  }

  addToContent() {
    this.blueprint.content = [...this.blueprint.content, this.itemToAdd];
  }

  async previewItem() {
    this.itemToAdd = null;

    try {
      if (this.itemType === 'module') {
        const module = await this.store.findRecord('module', this.itemValue);
        this.itemToAdd = {
          type: 'module',
          value: module.id,
          label: module.title,
          shortId: module.shortId,
          image: module.details.image,
        };
      } else {
        const targetProfile = await this.store.findRecord('target-profile', this.itemValue);
        this.itemToAdd = {
          type: 'evaluation',
          value: Number(this.itemValue),
          label: targetProfile.internalName,
          image: targetProfile.imageUrl,
        };
      }
    } catch (responseError) {
      this.#handleErrorForResource(this.itemType, responseError);
      this.itemAddDisabled = true;
    }
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
      await this.blueprint.save({
        adapterOptions:
          this.selectedTubes && this.selectedTubes.length
            ? { cappedTubeRequirements: [{ tubes: this.selectedTubes, threshold: this.threshold }] }
            : null,
      });
      this.pixToast.sendSuccessNotification({
        message: this.args.updateMode
          ? this.intl.t('components.combined-course-blueprints.update.notifications.success')
          : this.intl.t('components.combined-course-blueprints.create.notifications.success'),
      });
      this.router.transitionTo('authenticated.combined-course-blueprints.list');
    } catch (responseError) {
      if (!responseError.errors) {
        return this.pixToast.sendErrorNotification({
          message: this.args.updateMode
            ? this.intl.t('components.combined-course-blueprints.update.notifications.error')
            : this.intl.t('components.combined-course-blueprints.create.notifications.error'),
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
    if (this.itemValue === '') {
      this.itemAddDisabled = true;
    }
  }

  @action
  async setItemValue(e) {
    this.itemValue = e.target.value;

    if (this.itemValue === '') {
      this.itemAddDisabled = true;
      this.itemToAdd = null;
    } else {
      this.itemAddDisabled = false;
      await this.previewItem();
    }
  }

  @action
  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.setItemValue(event);
      this.addItem(event);
    }
  }

  @action
  removeRequirement(value) {
    this.blueprint.content = this.blueprint.content.filter(
      (item) => item.id !== value.id || item.shortId !== value.shortId,
    );
  }

  @action
  updateTubes(tubes) {
    this.selectedTubes = tubes.map(({ id, level }) => ({
      tubeId: id,
      level,
    }));
  }

  @action
  onThresholdChange(e) {
    this.threshold = e.target.value;
  }

  @action
  goToListPage() {
    this.router.transitionTo('authenticated.combined-course-blueprints.list');
  }

  @action
  getItemColor(type) {
    return type === 'evaluation' ? 'purple' : 'blue';
  }

  <template>
    <form class="combined-course-blueprint-form">
      <h1 class="combined-course-blueprint-form__title">
        {{if
          @updateMode
          (t "components.combined-course-blueprints.update.title")
          (t "components.combined-course-blueprints.create.title")
        }}</h1>

      <GeneralInfoSection
        @blueprint={{this.blueprint}}
        @setData={{this.setData}}
        @setAttestation={{this.setAttestation}}
        @updateMode={{@updateMode}}
        @model={{@model}}
      />

      {{#unless @updateMode}}
        <ContentSection
          @setItemType={{this.setItemType}}
          @addItem={{this.addItem}}
          @setItemValue={{this.setItemValue}}
          @blueprint={{this.blueprint}}
          @updateMode={{@updateMode}}
          @handleKeyPress={{this.handleKeyPress}}
          @removeRequirement={{this.removeRequirement}}
          @itemAddDisabled={{this.itemAddDisabled}}
          @itemToAdd={{this.itemToAdd}}
          @getItemColor={{this.getItemColor}}
        />
      {{/unless}}

      {{#if (or (and (not @updateMode) this.blueprint.rewardId) (and @updateMode this.blueprint.attestationLabel))}}
        <RewardRequirementsSection
          @blueprint={{this.blueprint}}
          @setData={{this.setData}}
          @updateMode={{@updateMode}}
          @model={{@model}}
          @updateTubes={{this.updateTubes}}
          @onThresholdChange={{this.onThresholdChange}}
          @selectedTubes={{this.selectedTubes}}
        />
      {{/if}}

      <fieldset class="controls">
        <PixButton class="combined-course-blueprint-form__button" @triggerAction={{this.save}} @variant="secondary">{{t
            "common.actions.cancel"
          }}</PixButton>
        <PixButton class="combined-course-blueprint-form__button" @triggerAction={{this.save}} @variant="success">{{if
            @updateMode
            (t "components.combined-course-blueprints.update.updateButton")
            (t "components.combined-course-blueprints.create.createButton")
          }}</PixButton>
      </fieldset>
    </form>
  </template>
}

const GeneralInfoSection = <template>
  <Card
    class="combined-course-blueprint-form__card"
    @title={{t "components.combined-course-blueprints.create.generalInfoCardTitle"}}
  >
    <PixInput
      @id="internalName"
      @value={{@blueprint.internalName}}
      @requiredLabel="Champ obligatoire"
      {{on "change" (fn @setData "internalName")}}
    >
      <:label>
        {{t "components.combined-course-blueprints.labels.internal-name"}}
      </:label>
    </PixInput>

    <PixInput
      @id="name"
      @value={{@blueprint.name}}
      @requiredLabel="Champ obligatoire"
      {{on "change" (fn @setData "name")}}
      @subLabel="Ce titre sera visible par les utilisateurs"
    >
      <:label>
        {{t "components.combined-course-blueprints.labels.name"}}
      </:label>
    </PixInput>

    <PixInput @id="illustration" @value={{@blueprint.illustration}} {{on "change" (fn @setData "illustration")}}>
      <:label>
        {{t "components.combined-course-blueprints.labels.illustration"}}

      </:label>
    </PixInput>

    <PixTextarea
      @id="description"
      @value={{@blueprint.description}}
      {{on "change" (fn @setData "description")}}
      rows="10"
      @subLabel={{t "components.combined-course-blueprints.labels.description-sublabel"}}
    >
      <:label>
        {{t "components.combined-course-blueprints.labels.description"}}
      </:label>
    </PixTextarea>
    <PixInput @id="surveyLink" @value={{@blueprint.surveyLink}} {{on "change" (fn @setData "surveyLink")}} rows="10">
      <:label>
        {{t "components.combined-course-blueprints.labels.survey-link"}}
      </:label>
    </PixInput>
    {{#unless @updateMode}}
      <SelectAttestation
        @attestations={{@model.attestations}}
        @value={{@blueprint.rewardId}}
        @onChange={{@setAttestation}}
      />
    {{/unless}}

  </Card>
</template>;

const ContentSection = <template>
  <Card
    class="combined-course-blueprint-form__card"
    @title={{t "components.combined-course-blueprints.create.content"}}
  >
    <div class="content-section">
      <div class="content-section__add-items-column">
        <fieldset class="content-section__add-items-column--options">
          <legend>{{t "components.combined-course-blueprints.create.fieldsetElement"}}</legend>
          <PixRadioButton
            name="itemType"
            @value="evaluation"
            checked={{if (eq @itemType "evaluation") "checked"}}
            {{on "change" @setItemType}}
          >
            <:label>{{t "components.combined-course-blueprints.labels.target-profile"}}</:label>
          </PixRadioButton>
          <PixRadioButton
            name="itemType"
            checked={{if (eq @itemType "module") "checked"}}
            @value="module"
            {{on "change" @setItemType}}
          >
            <:label>{{t "components.combined-course-blueprints.labels.module"}}</:label>
          </PixRadioButton>
        </fieldset>
        <div class="content-section__add-item">
          <PixInput
            @id="itemId"
            @value={{@itemValue}}
            @requiredLabel="Champ obligatoire"
            {{on "change" @setItemValue}}
            {{on "keyup" @handleKeyPress}}
            class="combined-course-blueprint-form__input"
          >
            <:label>
              {{t "components.combined-course-blueprints.labels.itemId"}}
            </:label>
          </PixInput>
        </div>
        {{#if @itemToAdd}}
          <Card class="combined-course-blueprint-form__card--item-to-add">
            <div class="combined-course-blueprint-form__card--image">
              <img src={{@itemToAdd.image}} alt={{@itemToAdd.label}} />
            </div>
            <div class="combined-course-blueprint-form__card--item-to-add-text">
              <PixTag class="combined-course-blueprint-form__card--requirement-tag">{{@itemToAdd.type}}</PixTag>
              {{#if (eq @itemToAdd.type "module")}}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://app.recette.pix.fr/modules/{{@requirement.shortId}}/slug/details"
                >{{@itemToAdd.label}}</a>
              {{/if}}
              {{#if (eq @itemToAdd.type "evaluation")}}
                <LinkTo
                  @route="authenticated.target-profiles.target-profile.details"
                  @model={{@requirement.value}}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{@itemToAdd.label}}
                </LinkTo>
              {{/if}}
            </div>
          </Card>
        {{/if}}
        <PixButton
          @isDisabled={{@itemAddDisabled}}
          @variant="secondary"
          @triggerAction={{@addItem}}
          class="combined-course-blueprint-form__button"
        >{{t "components.combined-course-blueprints.create.addItemButton"}}</PixButton>
      </div>
      <div class="content-section__items-preview-column">
        <h3 class="content-section__title">
          {{t "components.combined-course-blueprints.create.courseContent"}}</h3>
        <div>
          {{#if (gt @blueprint.content.length 0)}}
            <PixTable @variant="admin" @data={{@blueprint.content}} class="table">
              <:columns as |row context|>
                <PixTableColumn @context={{context}}>
                  <:header>
                    {{t "components.combined-course-blueprints.items.item-type-header"}}
                  </:header>
                  <:cell>
                    <PixTag @color={{@getItemColor row.type}}>{{row.type}}</PixTag>
                  </:cell>
                </PixTableColumn>
                <PixTableColumn @context={{context}}>
                  <:header>
                    {{t "components.combined-course-blueprints.items.item-name-header"}}
                  </:header>
                  <:cell>
                    {{#if (eq row.type "MODULE")}}
                      {{row.shortId}}
                    {{else}}
                      {{row.id}}
                    {{/if}}
                    {{row.label}}
                  </:cell>
                </PixTableColumn>
                <PixTableColumn @context={{context}}>
                  <:header>
                    {{t "components.combined-course-blueprints.items.action-header"}}
                  </:header>
                  <:cell>
                    <PixIconButton
                      @iconName="delete"
                      @triggerAction={{fn @removeRequirement row}}
                      @ariaLabel="Supprimer"
                    />
                  </:cell>
                </PixTableColumn>
              </:columns>

            </PixTable>
          {{else}}
            <p> {{t "components.combined-course-blueprints.create.contentFeedback"}}</p>
          {{/if}}
        </div>
      </div>
    </div>
  </Card>
</template>;

const RewardRequirementsSection = <template>
  <Card
    class="combined-course-blueprint-form__card"
    @title={{t "components.combined-course-blueprints.create.attestations"}}
  >
    <PixTextarea
      @id="reward-requirements"
      @value={{@blueprint.rewardRequirements}}
      {{on "change" (fn @setData "rewardRequirements")}}
      rows="10"
    >
      <:label>
        {{t "components.combined-course-blueprints.labels.reward-requirements"}}
      </:label>
    </PixTextarea>

    {{#unless @updateMode}}
      {{#if @blueprint.rewardId}}
        <TubesSelection @frameworks={{@model.frameworks}} @onChange={{@updateTubes}} />
        {{#if @selectedTubes.length}}
          <PixInput
            @id="blueprintThreshold"
            class="combined-course-blueprint-form__threshold"
            type="number"
            min="0"
            max="100"
            @requiredLabel={{t "common.forms.mandatory"}}
            {{on "change" @onThresholdChange}}
          >
            <:label>Taux de réussite requis</:label>
          </PixInput>
        {{/if}}
      {{/if}}
    {{/unless}}
  </Card>
</template>;
