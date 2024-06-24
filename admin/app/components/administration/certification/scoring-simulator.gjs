import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
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
    <PixBlock class="page-section">

      <h2 class="page-section__title">
        {{t "pages.administration.certification.scoring-simulator.title"}}
      </h2>

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
        <PixMessage class="scoring-simulator-form__error-message" @type="error">{{error}}</PixMessage>
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
    </PixBlock>

    {{#if this.simulatorReport.data.attributes.competences}}
      <PixBlock class="scoring-simulator__competences">
        <table
          aria-label="{{t 'pages.administration.certification.scoring-simulator.table.label'}}"
          class="table-admin"
        >
          <thead class="scoring-simulator-competences-table__header">
            <tr>
              <th scope="col">{{t "pages.administration.certification.scoring-simulator.table.headers.competence"}}</th>
              <th scope="col">{{t "pages.administration.certification.scoring-simulator.table.headers.level"}}</th>
            </tr>
          </thead>
          <tbody class="scoring-simulator-competences-table__body">
            {{#each this.simulatorReport.data.attributes.competences as |competence|}}
              <tr>
                <th scope="row">{{competence.competenceCode}}</th>
                <td>{{competence.level}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </PixBlock>
    {{/if}}
  </template>
}
