import Ember from 'ember';

const contentReference = {
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

function _setFocusOnFirstTabbableElement(modalId) {
  const $tabbableElementInModal = Ember.$(modalId).find(':tabbable');

  const $firstElementToFocus = $tabbableElementInModal.get(0);
  $firstElementToFocus.focus();
}

export default Ember.Component.extend({

  modal: Ember.inject.service('current-routed-modal'),

  classNames: [ 'comparison-window' ],

  answer: null,
  challenge: null,
  solution: null,
  index: null,

  isAssessmentChallengeTypeQroc: Ember.computed.equal('challenge.type', 'QROC'),
  isAssessmentChallengeTypeQcm: Ember.computed.equal('challenge.type', 'QCM'),
  isAssessmentChallengeTypeQcu: Ember.computed.equal('challenge.type', 'QCU'),
  isAssessmentChallengeTypeQrocm: Ember.computed.equal('challenge.type', 'QROCM'),
  isAssessmentChallengeTypeQrocmInd: Ember.computed.equal('challenge.type', 'QROCM-ind'),
  isAssessmentChallengeTypeQrocmDep: Ember.computed.equal('challenge.type', 'QROCM-dep'),

  didInsertElement() {
    this._super(...arguments);

    const modalId = '#' + this.elementId;

    _setFocusOnFirstTabbableElement(modalId);

    Ember.$(modalId).find(':tabbable').last().on('blur', function() {
      _setFocusOnFirstTabbableElement(modalId);
    });
  },

  keyUp(event) {
    if(event.key === 'Escape') {
      this.get('modal').close();
    }

    event.preventDefault();
  },

  didDestroyElement() {
    Ember.$('#open-comparison_' + this.get('index')).focus();
  },

  resultItem: Ember.computed('answer.result', function() {
    let resultItem = contentReference[ 'default' ];
    const answerStatus = this.get('answer.result');

    if (answerStatus && (answerStatus in contentReference)) {
      resultItem = contentReference[ answerStatus ];
    }
    return resultItem;
  })
});
