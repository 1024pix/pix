import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CertificationTechnicalErrorService extends Service {
  @tracked hasError = false;
  @tracked isToBeCancelled = false;

  setError({ isToBeCancelled }) {
    this.hasError = true;
    this.isToBeCancelled = isToBeCancelled;
  }

  reset() {
    this.hasError = false;
    this.isToBeCancelled = false;
  }
}
