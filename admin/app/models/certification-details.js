// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import Model, { attr } from '@ember-data/model';
import { memberAction } from 'ember-api-actions';
import dayjs from 'dayjs';

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
    let count = 1;
    return this.listChallengesAndAnswers.map((answer) => {
      answer.order = count;
      count++;
      return answer;
    });
  }

  @computed('answers', 'competencesWithMark')
  get competences() {
    let competences = this.competencesWithMark.reduce((accumulator, competence) => {
      accumulator[competence.index] = competence;
      return accumulator;
    }, {});

    competences = this.answers.reduce((accumulator, answer) => {
      if (accumulator[answer.competence]) {
        if (!accumulator[answer.competence].answers) {
          accumulator[answer.competence].answers = [];
        }
        accumulator[answer.competence].answers.push(answer);
      }
      return accumulator;
    }, competences);
    const sortedCompetences = [];
    Object.keys(competences)
      .sort()
      .forEach((key) => {
        sortedCompetences.push(competences[key]);
      });
    return sortedCompetences;
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
