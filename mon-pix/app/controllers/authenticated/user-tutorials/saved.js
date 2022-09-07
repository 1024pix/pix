import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SavedController extends Controller {
  @tracked isSidebarVisible = false;

  pageOptions = [
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
  ];

  @action
  refresh() {
    this.send('refreshModel');
  }

  @action
  showSidebar() {
    this.isSidebarVisible = true;
  }

  @action
  closeSidebar() {
    this.isSidebarVisible = false;
  }
}
