import Component from '@glimmer/component';

const LEVEL = 'Niveau';
const THRESHOLD = 'Seuil';

export default class StagesStage extends Component {
  get isTypeLevel() {
    return this.args.model.isTypeLevel;
  }

  get stageTypeName() {
    return this.isTypeLevel ? LEVEL : THRESHOLD;
  }
}
