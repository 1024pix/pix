import { service } from '@ember/service';
import Model, { attr } from '@warp-drive/legacy/model';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';

const PIX_PLUS_INDEX = '';

export default class CertificationDetails extends Model {
  @service intl;

  @attr() competencesWithMark;
  @attr() totalScore;
  @attr() percentageCorrectAnswers;
  @attr() createdAt;
  @attr() userId;
  @attr() status;
  @attr() lastAnswerAt;
  @attr() listChallengesAndAnswers;
  version = 2;

  get answers() {
    return this.listChallengesAndAnswers.map((answer, index) => {
      answer.order = index + 1;
      return answer;
    });
  }

  get competences() {
    const answersByCompetence = groupBy(this.answers, 'competence');

    const competences = this.competencesWithMark.map((competenceWithMark) => {
      return {
        ...competenceWithMark,
        answers: answersByCompetence[competenceWithMark.index],
      };
    });
    if (this.#includePixPlusCompetences(answersByCompetence)) {
      competences.push({
        index: PIX_PLUS_INDEX,
        name: 'Pix +',
        answers: answersByCompetence[PIX_PLUS_INDEX],
      });
    }

    return sortBy(competences, 'index');
  }

  get creationDate() {
    return this.createdAt ? this.intl.formatDate(this.createdAt, { format: 'long' }) : null;
  }

  get lastAnswerDate() {
    return this.lastAnswerAt ? this.intl.formatDate(this.lastAnswerAt, { format: 'long' }) : null;
  }

  #includePixPlusCompetences(answersByCompetence) {
    return answersByCompetence[PIX_PLUS_INDEX];
  }
}
