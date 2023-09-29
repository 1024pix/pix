import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';

export default class Home extends Controller {
  @service router;
  @tracked schoolCode;

  get upperCaseCode() {
    return this.schoolCode.toUpperCase();
  }

  @action
  updateCode(code) {
    this.schoolCode = code;
  }

  @action
  goToSchool() {
    this.router.transitionTo('school', this.upperCaseCode);
  }
}
