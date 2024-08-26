import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import isInteger from 'lodash/isInteger';

import StageLevelSelect from '../../stages/stage-level-select';

export default class NewStage extends Component {
  @tracked thresholdStatus = 'default';
  @tracked titleStatus = 'default';
  @tracked messageStatus = 'default';

  constructor(...args) {
    super(...args);
    const { stage } = this.args;

    this.threshold = stage.threshold;
    this.title = stage.title;
    this.message = stage.message;
  }

  @action
  checkThresholdValidity(event) {
    const threshold = Number(event.target.value);
    if (
      !isInteger(threshold) ||
      this.args.unavailableThresholds.includes(threshold) ||
      threshold < 0 ||
      threshold > 100
    ) {
      this.args.stage.set('threshold', null);
      this.thresholdStatus = 'error';
      return;
    }

    this.thresholdStatus = 'success';
    this.args.stage.set('threshold', threshold);
  }

  @action
  checkTitleValidity(event) {
    const title = event.target.value.trim();

    if (!title) {
      this.titleStatus = 'error';
      this.args.stage.set('title', null);
      return;
    }
    this.titleStatus = 'success';
    this.args.stage.set('title', title);
  }

  @action
  checkMessageValidity(event) {
    const message = event.target.value.trim();

    if (!message) {
      this.messageStatus = 'error';
      this.args.stage.set('message', null);
      return;
    }
    this.messageStatus = 'success';
    this.args.stage.set('message', message);
  }

  <template>
    <tr aria-label="Informations sur le palier {{@title}}">
      <td>
        {{#if @stage.isFirstSkill}}
          1er acquis
        {{else}}
          {{#if @stage.isTypeLevel}}
            <StageLevelSelect
              @availableLevels={{@availableLevels}}
              @onChange={{@setLevel}}
              @value={{@stage.levelAsString}}
              class="stages-table__level-select"
              required="true"
              @isDisabled={{@stage.isZeroStage}}
              @label="Niveau du palier"
              @id={{concat "threshold-" @index}}
            />
          {{else}}
            <div class="table__cell--percentage">
              <PixInput
                @id={{concat "threshold-" @index}}
                @errorMessage="Le seuil est invalide"
                @validationStatus={{this.thresholdStatus}}
                @requiredLabel={{t "common.forms.mandatory"}}
                type="number"
                @value={{this.threshold}}
                readonly={{@stage.isZeroStage}}
                @screenReaderOnly={{true}}
                {{on "focusout" this.checkThresholdValidity}}
              >
                <:label>Seuil du palier</:label>
              </PixInput>
              <span>%</span>
            </div>
          {{/if}}
        {{/if}}
      </td>
      <td>
        <PixInput
          @id={{concat "title-" @index}}
          @errorMessage="Le titre est vide"
          @validationStatus={{this.titleStatus}}
          @value={{this.title}}
          @requiredLabel={{t "common.forms.mandatory"}}
          @screenReaderOnly={{true}}
          {{on "focusout" this.checkTitleValidity}}
        >
          <:label>Titre du palier</:label>
        </PixInput>
      </td>
      <td>
        <PixInput
          @id={{concat "message-" @index}}
          @errorMessage="Le message est vide"
          @validationStatus={{this.messageStatus}}
          @requiredLabel={{t "common.forms.mandatory"}}
          @screenReaderOnly={{true}}
          @value={{this.message}}
          {{on "focusout" this.checkMessageValidity}}
        >
          <:label>Message du palier</:label>
        </PixInput>
      </td>
      <td>
        À renseigner ultérieurement
      </td>
      <td>
        À renseigner ultérieurement
      </td>
      <td>
        {{#unless @stage.isZeroStage}}
          <PixButton
            @variant="error"
            @size="small"
            aria-label="Supprimer palier"
            @triggerAction={{@remove}}
            @iconBefore="trash"
          >
            Supprimer
          </PixButton>
        {{/unless}}
      </td>
    </tr>
  </template>
}
