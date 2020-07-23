import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class ListItems extends Component {

  @action
  selectCampaignCreator(event) {
    return this.args.updateCampaignCreator(event.target.value || null);
  }
}
