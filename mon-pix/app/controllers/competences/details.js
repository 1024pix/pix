import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class DetailsController extends Controller {
  @service intl;

  pageTitle = this.intl.t('pages.competence-details.title');
}
