import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class TermsOfServicePoleEmploiController extends Controller {
  queryParams = ['authenticationKey'];

  @tracked authenticationKey = null;
}
