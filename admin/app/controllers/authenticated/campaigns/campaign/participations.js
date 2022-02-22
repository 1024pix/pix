import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';

const DEFAULT_PAGE_NUMBER = 1;

export default class CampaignParticipationsController extends Controller {
  queryParams = ['pageNumber', 'pageSize'];

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
}
