import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class RecommendedController extends Controller {
  pageOptions = [
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
  ];

  @tracked showSidebar = false;

  @action
  closeSidebar() {
    this.showSidebar = false;
  }

  @action
  openFilter() {
    this.showSidebar = true;
  }
}
