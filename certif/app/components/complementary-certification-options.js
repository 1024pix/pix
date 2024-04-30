import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class ComplementaryCertificationOptions extends Component {
  @action
  updateComplementaryCertification(complementaryCertification) {
    this.args.updateComplementaryCertification(complementaryCertification);
  }
}
