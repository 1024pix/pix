import Component from '@glimmer/component';

export default class StageList extends Component {

  get hasStages() {
    return this.args.model.list.length > 0;
  }
}
