import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class PreviousPageButton extends Component {
  @service router;

  @action
  goToPage() {
    if (this.args.routeId) {
      this.router.transitionTo(this.args.route, this.args.routeId);
    } else {
      this.router.transitionTo(this.args.route);
    }
  }
}
