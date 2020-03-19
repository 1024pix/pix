import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import resultIconUrl from 'mon-pix/utils/result-icon-url';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

const TEXT_FOR_RESULT = {
  ok: {
    status: 'ok',
    title: 'Vous avez la bonne réponse !',
    tooltip: 'Réponse correcte'
  },

  ko: {
    status: 'ko',
    title: 'Vous n\'avez pas la bonne réponse',
    tooltip: 'Réponse incorrecte'
  },

  aband: {
    status: 'aband',
    title: 'Vous n\'avez pas donné de réponse',
    tooltip: 'Sans réponse'
  },

  partially: {
    status: 'partially',
    title: 'Vous avez donné une réponse partielle',
    tooltip: 'Réponse partielle'
  },

  timedout: {
    status: 'timedout',
    title: 'Vous avez dépassé le temps imparti',
    tooltip: 'Temps dépassé'
  },

  default: {
    status: 'default',
    title: '',
    tooltip: 'Correction automatique en cours de développement ;)'
  }
};

@classic
export default class ComparisonWindow extends Component {
  answer = null;
  index = null;

  @equal('answer.challenge.type', 'QROC')
  isAssessmentChallengeTypeQroc;

  @equal('answer.challenge.type', 'QCM')
  isAssessmentChallengeTypeQcm;

  @equal('answer.challenge.type', 'QCU')
  isAssessmentChallengeTypeQcu;

  @equal('answer.challenge.type', 'QROCM')
  isAssessmentChallengeTypeQrocm;

  @equal('answer.challenge.type', 'QROCM-ind')
  isAssessmentChallengeTypeQrocmInd;

  @equal('answer.challenge.type', 'QROCM-dep')
  isAssessmentChallengeTypeQrocmDep;

  @computed('answer.result')
  get resultItem() {
    let resultItem = TEXT_FOR_RESULT['default'];
    const answerStatus = this.get('answer.result');

    if (answerStatus && (answerStatus in TEXT_FOR_RESULT)) {
      resultItem = TEXT_FOR_RESULT[answerStatus];
    }
    return resultItem;
  }

  @computed('resultItem')
  get resultItemIcon() {
    return resultIconUrl(this.get('resultItem.status'));
  }
}
