import Model, { attr } from '@ember-data/model';
import values from 'lodash/values';

export default class CertificationDetails extends Model {

  @attr() competencesWithMark;
  @attr() totalScore;
  @attr() percentageCorrectAnswers;
  @attr() createdAt;
  @attr() userId;
  @attr() status;
  @attr() completedAt;
  @attr() listChallengesAndAnswers;

  get competences() {
    let competences = {};

    this.listChallengesAndAnswers.forEach((answer, index) => {
      answer.order = index + 1;
    });

    competences = this.competencesWithMark.reduce((accumulator, competence) => {
      accumulator[competence.index] = competence;
      return accumulator;
    }, competences);

    competences = this.listChallengesAndAnswers.reduce((accumulator, answerResult) => {
      const competenceIndex = answerResult.competence;
      if (accumulator[competenceIndex]) {
        if (!accumulator[competenceIndex].answers) {
          accumulator[competenceIndex].answers = [];
        }
        accumulator[competenceIndex].answers.push(answerResult);
      }
      return accumulator;
    }, competences);

    return values(competences);
  }

  get creationDate() {
    return (new Date(this.createdAt)).toLocaleString('fr-FR');
  }

  get completionDate() {
    return (new Date(this.completedAt)).toLocaleString('fr-FR');
  }
}
