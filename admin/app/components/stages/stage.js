import Component from '@glimmer/component';

const LEVEL = 'Niveau';
const THRESHOLD = 'Seuil';

export default class Stage extends Component {
  get stageTypeName() {
    return this.args.stage.isTypeLevel ? LEVEL : THRESHOLD;
  }
}
