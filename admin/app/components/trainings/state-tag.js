import Component from '@glimmer/component';

export default class StateTag extends Component {
  get color() {
    if (this.args.isDisabled === true) {
      return 'error';
    } else {
      return 'primary';
    }
  }

  get content() {
    if (this.args.isDisabled === true) {
      return 'En pause';
    } else {
      return 'Actif';
    }
  }
}
