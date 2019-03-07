import { equal } from '@ember/object/computed';
import Component from '@ember/component';
import { computed } from '@ember/object';
import resultIconUrl from 'mon-pix/utils/result-icon-url';

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

export default Component.extend({

  answer: null,
  challenge: null,
  correction: null,
  index: null,

  isAssessmentChallengeTypeQroc: equal('challenge.type', 'QROC'),
  isAssessmentChallengeTypeQcm: equal('challenge.type', 'QCM'),
  isAssessmentChallengeTypeQcu: equal('challenge.type', 'QCU'),
  isAssessmentChallengeTypeQrocm: equal('challenge.type', 'QROCM'),
  isAssessmentChallengeTypeQrocmInd: equal('challenge.type', 'QROCM-ind'),
  isAssessmentChallengeTypeQrocmDep: equal('challenge.type', 'QROCM-dep'),

  resultItem: computed('answer.result', function() {
    let resultItem = TEXT_FOR_RESULT['default'];
    const answerStatus = this.get('answer.result');

    if (answerStatus && (answerStatus in TEXT_FOR_RESULT)) {
      resultItem = TEXT_FOR_RESULT[answerStatus];
    }
    return resultItem;
  }),

  resultItemIcon: computed('resultItem', function() {
    return resultIconUrl(this.get('resultItem.status'));
  }),
});
