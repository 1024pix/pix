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

  ERRORS = {
    SCORE: 'Merci d’indiquer un score en Pix compris entre O et 896',
    BOTH_INPUT_FILLED: 'Merci de ne renseigner que l’un des champs “Score global en Pix” ou “Capacité”',
    BOTH_INPUT_EMPTY: "Merci de renseigner au moins l'un des deux champs",
  };

  @action
  async onGenerateSimulationProfile(event) {
    event.preventDefault();
    this._cleanErrors();
    this.checkFormValidity();
    const adapter = this.store.adapterFor('scoring-and-capacity-simulator-report');
    const isFormInvalid = (!this.score && !this.capacity) || this.errors.length > 0;

    if (isFormInvalid) {
      return;
    }

    this.simulatorReport = await adapter.getSimulationResult({
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
}
