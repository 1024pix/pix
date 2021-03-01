import Component from '@glimmer/component';

export default class StageList extends Component {

  get hasStages() {
    return this.args.stages && this.args.stages.length > 0;
  }
}
