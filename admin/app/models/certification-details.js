import { computed } from '@ember/object';
import Model, { attr } from '@ember-data/model';

export default class CertificationDetails extends Model {

  @attr() competencesWithMark;
  @attr() totalScore;
  @attr() percentageCorrectAnswers;
  @attr() createdAt;
  @attr() userId;
  @attr() status;
  @attr() completedAt;
  @attr() listChallengesAndAnswers;

  @computed('competencesWithMark', 'listChallengesAndAnswers')
  get competences() {
    const competenceData = this.competencesWithMark;
    const answers = this.listChallengesAndAnswers;
    let count = 1;
    answers.forEach((answer) => {
      answer.order = count;
      count++;
    });
    let competences = competenceData.reduce((accumulator, value) => {
      accumulator[value.index] = value;
      return accumulator;
    }, {});
    competences = answers.reduce((accumulator, value) => {
      if (accumulator[value.competence]) {
        if (!accumulator[value.competence].answers) {
          accumulator[value.competence].answers = [];
        }
        accumulator[value.competence].answers.push(value);
      }
      return accumulator;
    }, competences);
    const sortedCompetences = [];
    Object.keys(competences).sort().forEach((key) => {
      sortedCompetences.push(competences[key]);
    });
    return sortedCompetences;
  }

  @computed('createdAt')
  get creationDate() {
    return (new Date(this.createdAt)).toLocaleString('fr-FR');
  }

  @computed('completedAt')
  get completionDate() {
    return (new Date(this.completedAt)).toLocaleString('fr-FR');
  }
}
