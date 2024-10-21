import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TabManagerService extends Service {
  @tracked activeTab = 0;

  setActiveTab(tab) {
    this.activeTab = tab;
  }
}
