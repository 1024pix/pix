import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import pick from 'ember-composable-helpers/helpers/pick';
import { t } from 'ember-intl';
import set from 'ember-set-helper/helpers/set';
import isInteger from 'lodash/isInteger';

import StageLevelSelect from './stage-level-select';

export default class UpdateStage extends Component {
  @service notifications;

  @tracked threshold;
  @tracked level;
  @tracked title;
  @tracked message;
  @tracked prescriberTitle;
  @tracked prescriberDescription;
  @tracked thresholdStatus = 'default';
  @tracked titleStatus = 'default';
  @tracked messageError = null;

  constructor() {
    super(...arguments);
    this.threshold = this.args.stage.threshold;
    this.level = this.args.stage.level?.toString();
    this.title = this.args.stage.title;
    this.message = this.args.stage.message;
    this.prescriberTitle = this.args.stage.prescriberTitle;
    this.prescriberDescription = this.args.stage.prescriberDescription;
    this.isThresholdOrLevelDisabled = this.threshold === 0 || this.level === '0' || this.args.hasLinkedCampaign;
  }

  async _updateStage() {
    const model = this.args.stage;
    model.threshold = this.threshold ?? null;
    model.level = this.level ?? null;
    model.title = this.title ? this.title.trim() : null;
    model.message = this.message ? this.message.trim() : null;
    model.prescriberTitle = this.prescriberTitle ? this.prescriberTitle.trim() : null;
    model.prescriberDescription = this.prescriberDescription ? this.prescriberDescription.trim() : null;
    try {
      await this.args.onUpdate();
      await this.notifications.success('Les modifications ont bien été enregistrées.');
      this.args.toggleEditMode();
    } catch (e) {
      model.rollbackAttributes();
      this.notifications.error(e.errors?.[0]?.detail ?? 'Une erreur est survenue.');
    }
  }

  @action
  async updateStage(event) {
    event.preventDefault();
    if ([this.thresholdStatus, this.titleStatus].includes('error')) return;
    await this._updateStage();
  }

  @action
  setLevel(level) {
    this.level = level;
  }

  @action
  checkThresholdValidity(event) {
    const newThreshold = Number(event.target.value);
    if (
      !isInteger(newThreshold) ||
      newThreshold < 0 ||
      newThreshold > 100 ||
      this.args.unavailableThresholds.includes(newThreshold)
    ) {
      this.thresholdStatus = 'error';
      this.threshold = null;
      return;
    }

    this.thresholdStatus = 'success';
    this.threshold = newThreshold;
  }

  @action
  checkTitleValidity(event) {
    const title = event.target.value.trim();

    if (!title) {
      this.titleStatus = 'error';
      this.title = null;
      return;
    }
    this.titleStatus = 'success';
    this.title = title;
  }

  @action
  checkMessageValidity(event) {
    const message = event.target.value.trim();

    if (!message) {
      this.message = null;

      this.messageError = 'Message vide.';
      return;
    }
    this.messageError = null;
    this.message = message;
  }

  <template>
    <section class="page-section">

      <form class="form stage-form" {{on "submit" this.updateStage}}>
        <div class="form-field">
          {{#if @stage.isFirstSkill}}
            <label class="form-field__label">1er acquis</label>
          {{else if @isTypeLevel}}
            <StageLevelSelect
              @id="threshold-or-level"
              @availableLevels={{@availableLevels}}
              @isDisabled={{this.isThresholdOrLevelDisabled}}
              @onChange={{this.setLevel}}
              @label={{@stageTypeName}}
              @value={{this.level}}
            />
          {{else}}
            <PixInput
              @id="threshold-or-level"
              @errorMessage="Le seuil est invalide"
              @validationStatus={{this.thresholdStatus}}
              @requiredLabel={{t "common.forms.mandatory"}}
              type="number"
              readonly={{this.isThresholdOrLevelDisabled}}
              @value={{this.threshold}}
              min="0"
              max="100"
              {{on "focusout" this.checkThresholdValidity}}
            >
              <:label>{{@stageTypeName}}</:label>
            </PixInput>
          {{/if}}

          <PixInput
            @id="title"
            @errorMessage="Le titre est vide"
            @validationStatus={{this.titleStatus}}
            @requiredLabel={{t "common.forms.mandatory"}}
            @value={{this.title}}
            type="text"
            {{on "focusout" this.checkTitleValidity}}
          >
            <:label>Titre du palier</:label>
          </PixInput>

          <PixTextarea
            @id="message"
            @value={{this.message}}
            @errorMessage={{this.messageError}}
            {{on "focusout" this.checkMessageValidity}}
          >
            <:label>Message</:label>
          </PixTextarea>

          <PixInput
            @type="text"
            class="form-control"
            @value={{this.prescriberTitle}}
            maxlength="255"
            {{on "input" (pick "target.value" (set this "prescriberTitle"))}}
          ><:label>
              Titre pour le prescripteur
            </:label></PixInput>

          <PixTextarea
            class="form-control"
            @value={{this.prescriberDescription}}
            rows="4"
            {{on "input" (pick "target.value" (set this "prescriberDescription"))}}
          ><:label>
              Description pour le prescripteur
            </:label></PixTextarea>
        </div>
        <div class="form-actions">
          <PixButton @variant="secondary" @size="small" @triggerAction={{@toggleEditMode}}>
            {{t "common.actions.cancel"}}
          </PixButton>
          <PixButton @variant="success" @size="small" @type="submit">
            {{t "common.actions.save"}}
          </PixButton>
        </div>
      </form>
    </section>
  </template>
}
