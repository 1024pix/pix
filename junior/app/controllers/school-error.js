import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class SchoolError extends Controller {
  @service intl;

  get messages() {
    return [this.intl.t('pages.school.not-found.sentence-1'), this.intl.t('pages.school.not-found.sentence-2')];
  }
}
