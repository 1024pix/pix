import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class TubeList extends Component {
  @action
  toggleInput(event) {
    const el = event.currentTarget.querySelector('input');
    el.checked = !el.checked;
  }
}
