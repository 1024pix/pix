import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class CertificationCompetenceList extends Component {

  competenceList = ['1.1', '1.2', '1.3', '2.1', '2.2', '2.3', '2.4', '3.1', '3.2', '3.3', '3.4', '4.1', '4.2', '4.3', '5.1', '5.2'];

  get indexedValues() {
    const competences = this.args.competences;
    const indexedCompetences = competences.reduce((result, value) => {
      result[value.index] = value;
      return result;
    }, {});
    const competencesList = this.competenceList;
    const scores = [];
    const levels = [];
    let index = 0;
    competencesList.forEach((value) => {
      scores[index] = indexedCompetences[value] ? indexedCompetences[value].score : null;
      levels[index] = indexedCompetences[value] ? indexedCompetences[value].level : null;
      index++;
    });
    return {
      scores: scores,
      levels: levels,
    };
  }

  @action
  onScoreChange(index, event) {
    const list = this.competenceList;
    this.args.onUpdateScore(list[index], event.target.value);
  }

  @action
  onLevelChange(index, event) {
    const list = this.competenceList;
    this.args.onUpdateLevel(list[index], event.target.value);
  }
}
