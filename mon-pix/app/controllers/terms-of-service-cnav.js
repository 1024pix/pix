import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class TermsOfServiceCnavController extends Controller {
  queryParams = ['authenticationKey'];

  @tracked authenticationKey = null;
}
