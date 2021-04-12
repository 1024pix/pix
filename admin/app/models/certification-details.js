/* eslint-disable ember/no-computed-properties-in-native-classes */

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

    let competences = competenceData.reduce((accumulator, competence) => {
      accumulator[competence.index] = competence;
      return accumulator;
    }, {});

    competences = answers.reduce((accumulator, answer) => {
      if (accumulator[answer.competence]) {
        if (!accumulator[answer.competence].answers) {
          accumulator[answer.competence].answers = [];
        }
        accumulator[answer.competence].answers.push(answer);
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
