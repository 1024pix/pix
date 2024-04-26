import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ConfigurationController extends Controller {
  @tracked validationStatus = 'default';
  @tracked score = null;
  @tracked capacity = null;
  @tracked simulatorReport = null;
  @tracked errors = [];
  @service store;
  @service intl;

  ERRORS = {
    SCORE: this.intl.t('pages.certifications.scoring-simulation.errors.score'),
    BOTH_INPUT_FILLED: this.intl.t('pages.certifications.scoring-simulation.errors.both-input-filled'),
    BOTH_INPUT_EMPTY: this.intl.t('pages.certifications.scoring-simulation.errors.both-input-empty'),
  };

  @action
  async onGenerateSimulationProfile(event) {
    event.preventDefault();
    this._cleanErrors();
    this.checkFormValidity();

    const isFormInvalid = (!this.score && !this.capacity) || this.errors.length > 0;

    if (isFormInvalid) {
      return;
    }

    const query = this.score ? { score: this.score } : { capacity: this.capacity };

    this.simulatorReport = await this.store.queryRecord('scoring-and-capacity-simulator-report', query);
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
}
