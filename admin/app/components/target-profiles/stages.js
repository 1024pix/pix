import Component from '@glimmer/component';

export default class Stages extends Component {

  get hasStages() {
    const stages = this.args.stages;
    return stages && stages.length > 0;
  }
}
