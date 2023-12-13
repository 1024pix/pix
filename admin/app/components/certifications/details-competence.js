import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';

export default class CertificationDetailsCompetence extends Component {
  constructor() {
    super(...arguments);
  }

  get certifiedWidth() {
    const obtainedLevel = this.args.competence.obtainedLevel;
    return htmlSafe('width:' + Math.round((obtainedLevel / 8) * 100) + '%');
  }

  get positionedWidth() {
    const positionedLevel = this.args.competence.positionedLevel;
    return htmlSafe('width:' + Math.round((positionedLevel / 8) * 100) + '%');
  }

  get answers() {
    const competence = this.args.competence;
    return competence.answers;
  }
}
