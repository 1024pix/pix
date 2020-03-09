import { action } from '@ember/object';
import Component from '@ember/component';

export default class ListItems extends Component {
  @action
  selectCampaignCreator(event) {
    return this.updateCampaignCreator(event.target.value || null);
  }
}
