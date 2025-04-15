import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class ScoringSimulator extends Component {
  @tracked validationStatus = 'default';
  @tracked score = null;
  @tracked capacity = null;
  @tracked simulatorReport = null;
  @tracked errors = [];
  @service store;
  @service intl;

  ERRORS = {
    SCORE: this.intl.t('pages.administration.certification.scoring-simulator.errors.score'),
    BOTH_INPUT_FILLED: this.intl.t('pages.administration.certification.scoring-simulator.errors.both-input-filled'),
    BOTH_INPUT_EMPTY: this.intl.t('pages.administration.certification.scoring-simulator.errors.both-input-empty'),
  };

  @action
  async onGenerateSimulatorProfile(event) {
    event.preventDefault();
    this._cleanErrors();
    this.checkFormValidity();
    const adapter = this.store.adapterFor('scoring-and-capacity-simulator-report');
    const isFormInvalid = (!this.score && !this.capacity) || this.errors.length > 0;

    if (isFormInvalid) {
      return;
    }

    this.simulatorReport = await adapter.getSimulatorResult({
      score: this.score,
      capacity: this.capacity,
    });

    this.score = null;
    this.capacity = null;
  }

  @action
  updateScore(event) {
    this._cleanErrors();
    this.score = event.target.value;
  }

  @action
  updateCapacity(event) {
    this._cleanErrors();
    this.capacity = event.target.value;
  }

  checkFormValidity() {
    if (!this.score && !this.capacity) {
      this.errors = [...this.errors, this.ERRORS.BOTH_INPUT_EMPTY];
    }
    if (this.score && this.capacity) {
      this.errors = [...this.errors, this.ERRORS.BOTH_INPUT_FILLED];
    }
    if (this.score > 896 || this.score < 0) {
      this.errors = [...this.errors, this.ERRORS.SCORE];
    }
  }

  _cleanErrors() {
    this.errors = [];
  }

  <template>
    <section class="page-section">
      <header class="page-section__header">
        <h2 class="page-section__title">
          {{t "pages.administration.certification.scoring-simulator.title"}}
        </h2>
      </header>

      <form class="scoring-simulator-form">
        <PixInput {{on "input" this.updateScore}} @id="score" @value={{this.score}} type="number">
          <:label>{{t "pages.administration.certification.scoring-simulator.labels.score-input"}}</:label>
        </PixInput>

        <PixInput @id="capacity" {{on "input" this.updateCapacity}} @value={{this.capacity}} type="number">
          <:label>{{t "pages.administration.certification.scoring-simulator.labels.capacity-input"}}</:label>
        </PixInput>

        <PixButton
          class="scoring-simulator__form-button"
          @type="submit"
          @triggerAction={{this.onGenerateSimulatorProfile}}
        >{{t "pages.administration.certification.scoring-simulator.actions.submit"}}</PixButton>
      </form>

      {{#each this.errors as |error|}}
        <PixNotificationAlert
          class="scoring-simulator-form__error-message"
          @type="error"
        >{{error}}</PixNotificationAlert>
      {{/each}}

      <dl class="scoring-simulator__data">
        <div class="scoring-simulator-data__container">
          <dt class="scoring-simulator-data-container__label">{{t
              "pages.administration.certification.scoring-simulator.labels.score"
            }}</dt>
          <dd>{{this.simulatorReport.data.attributes.score}}</dd>
        </div>
        <div class="scoring-simulator-data__container">
          <dt class="scoring-simulator-data-container__label">{{t
              "pages.administration.certification.scoring-simulator.labels.capacity"
            }}</dt>
          <dd>{{this.simulatorReport.data.attributes.capacity}}</dd>
        </div>
      </dl>

      {{#if this.simulatorReport.data.attributes.competences}}
        <PixTable
          @variant="admin"
          @caption={{t "pages.administration.certification.scoring-simulator.table.label"}}
          @data={{this.simulatorReport.data.attributes.competences}}
        >
          <:columns as |competence context|>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.administration.certification.scoring-simulator.table.headers.competence"}}
              </:header>
              <:cell>
                {{competence.competenceCode}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.administration.certification.scoring-simulator.table.headers.level"}}
              </:header>
              <:cell>
                {{competence.level}}
              </:cell>
            </PixTableColumn>
          </:columns>
        </PixTable>
      {{/if}}
    </section>
  </template>
}
