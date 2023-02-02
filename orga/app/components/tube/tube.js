import Component from '@glimmer/component';

export default class Tube extends Component {
  get checked() {
    return this.args.isTubeSelected(this.args.tube);
  }

  set checked(checked) {
    if (checked) {
      this.args.selectTube(this.args.tube);
    } else {
      this.args.unselectTube(this.args.tube);
    }
  }
}
