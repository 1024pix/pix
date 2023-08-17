import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';

export default class CertificationDetailsCompetence extends Component {
  juryRate = false;

  constructor() {
    super(...arguments);
    this.juryRate = false;
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

  get competenceJury() {
    const juryRate = this.args.juryRate;
    const competence = this.args.competence;
    if (juryRate === false) {
      competence.juryScore = false;
      competence.juryLevel = false;
      return false;
    }
    const score = competence.obtainedScore;
    const newScore = this._computeScore(juryRate);
    if (newScore.score != score) {
      competence.juryScore = newScore.score;
      competence.juryLevel = newScore.level;
      return {
        score: newScore.score,
        level: newScore.level,
        width: htmlSafe('width:' + Math.round((newScore.level / 8) * 100) + '%'),
      };
    } else {
      competence.juryScore = false;
      competence.juryLevel = false;
      return false;
    }
  }

  _computeScore(rate) {
    if (rate < 50) {
      return { score: 0, level: -1 };
    }
    const competence = this.args.competence;
    const score = competence.positionedScore;
    const level = competence.positionedLevel;
    const answers = competence.answers;
    let answersData = { good: 0, partially: 0, count: 0 };
    if (answers) {
      answersData = answers.reduce((data, answer) => {
        const value = answer.jury ? answer.jury : answer.result;
        if (value === 'ok') {
          data.good++;
        } else if (value === 'partially') {
          data.partially++;
        }
        if (value !== 'skip') {
          data.count++;
        }
        return data;
      }, answersData);
    }
    switch (answersData.count) {
      case 0:
        return { score: 0, level: -1 };
      case 1:
        if (answersData.good === 1) {
          return { score: score, level: level };
        }
        return { score: 0, level: 0 };
      case 2:
        if (answersData.good === 2) {
          return { score: score, level: level };
        } else if (answersData.good === 1) {
          if (answersData.partially === 1) {
            if (rate >= 80) {
              return { score: score, level: level };
            } else {
              return { score: score - 8, level: level - 1 };
            }
          }
        }
        return { score: 0, level: -1 };
      case 3:
        if (answersData.good === 3) {
          return { score: score, level: level };
        } else if (answersData.good === 2) {
          if (rate >= 80) {
            return { score: score, level: level };
          } else {
            return { score: score - 8, level: level - 1 };
          }
        }
        return { score: 0, level: -1 };
    }
  }
}
