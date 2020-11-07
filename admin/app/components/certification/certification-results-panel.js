import { action } from '@ember/object';
import Component from '@glimmer/component';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';

export default class CertificationCertificationResultsPanelComponent extends Component {

  @action
  onUpdateScore(code, value) {
    this._updatePropForCompetence(code, value, 'score', 'level');
  }

  @action
  onUpdateLevel(code, value) {
    this._updatePropForCompetence(code, value, 'level', 'score');
  }

  _copyCompetences() {
    return cloneDeep(this.certification.competencesWithMark);
  }

  _updatePropForCompetence(competenceCode, value, propName, linkedPropName) {
    const competences = this._copyCompetences();
    const competence = find(competences, { competence_code: competenceCode });
    if (competence) {
      if (value.trim().length === 0) {
        if (competence[linkedPropName]) {
          competence[propName] = null;
        } else {
          this._removeFromArray(competences, competence);
        }
      } else {
        competence[propName] = parseInt(value);
      }
    } else if (value.trim().length > 0) {
      competences.addObject({
        competence_code: competenceCode,
        [propName]: parseInt(value),
        area_code: competenceCode.substr(0, 1),
      });
    }
    this.args.certification.competencesWithMark = competences;
  }
}
