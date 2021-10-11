import Component from '@glimmer/component';

export default class Footer extends Component {
  get currentYear() {
    const date = new Date();
    return date.getFullYear().toString();
  }
}
