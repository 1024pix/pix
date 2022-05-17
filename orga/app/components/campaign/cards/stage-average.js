import Component from '@glimmer/component';

export default class StageAverage extends Component {
  get valuePercentage() {
    return Math.round(this.args.value * 100);
  }
}
