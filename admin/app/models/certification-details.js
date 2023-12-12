// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import Model, { attr } from '@ember-data/model';
import { memberAction } from 'ember-api-actions';
import dayjs from 'dayjs';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';

export default class CertificationDetails extends Model {
  @attr() competencesWithMark;
  @attr() totalScore;
  @attr() percentageCorrectAnswers;
  @attr() createdAt;
  @attr() userId;
  @attr() status;
  @attr() completedAt;
  @attr() listChallengesAndAnswers;

  @computed('listChallengesAndAnswers', 'listChallengesAndAnswers.@each.isNeutralized')
  get answers() {
    return this.listChallengesAndAnswers.map((answer, index) => {
      answer.order = index + 1;
      return answer;
    });
  }

  @computed('answers', 'competencesWithMark')
  get competences() {
    const answersByCompetence = groupBy(this.answers, 'competence');

    const competences = this.competencesWithMark.map((competenceWithMark) => {
      return {
        ...competenceWithMark,
        answers: answersByCompetence[competenceWithMark.index],
      };
    });

    return sortBy(competences, 'index');
  }

  @computed('createdAt')
  get creationDate() {
    return dayjs(this.createdAt).format('DD/MM/YYYY, HH:mm:ss');
  }

  @computed('completedAt')
  get completionDate() {
    return dayjs(this.completedAt).format('DD/MM/YYYY, HH:mm:ss');
  }

  neutralizeChallenge = memberAction({
    path: 'neutralize-challenge',
    type: 'post',
    urlType: 'challenge-neutralization',
    before(attributes) {
      return {
        data: {
          attributes,
        },
      };
    },
  });

  deneutralizeChallenge = memberAction({
    path: 'deneutralize-challenge',
    type: 'post',
    urlType: 'challenge-neutralization',
    before(attributes) {
      return {
        data: {
          attributes,
        },
      };
    },
  });
}
