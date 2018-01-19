import { equal } from '@ember/object/computed';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import { computed } from '@ember/object';
import $ from 'jquery';
import resultIconUrl from 'pix-live/utils/result-icon-url';
import { EKMixin, keyUp } from 'ember-keyboard';
import FocusableComponent from 'ember-component-focus/mixins/focusable-component';

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

export default Component.extend(EKMixin, FocusableComponent, {

  modal: service('current-routed-modal'),

  classNames: [ 'comparison-window' ],

  answer: null,
  challenge: null,
  solution: null,
  index: null,

  focusNode: '.routable-modal--close-button',

  isAssessmentChallengeTypeQroc: equal('challenge.type', 'QROC'),
  isAssessmentChallengeTypeQcm: equal('challenge.type', 'QCM'),
  isAssessmentChallengeTypeQcu: equal('challenge.type', 'QCU'),
  isAssessmentChallengeTypeQrocm: equal('challenge.type', 'QROCM'),
  isAssessmentChallengeTypeQrocmInd: equal('challenge.type', 'QROCM-ind'),
  isAssessmentChallengeTypeQrocmDep: equal('challenge.type', 'QROCM-dep'),

  activateKeyboard: on('init', function() {
    this.set('keyboardActivated', true);
  }),

  closeOnEsc: on(keyUp('Escape'), function() {
    this.get('modal').close();
  }),

  didInsertElement() {
    this._super(...arguments);
    this.focus();
  },

  didDestroyElement() {
    $('#open-comparison_' + this.get('index')).focus();
  },

  resultItem: computed('answer.result', function() {
    let resultItem = contentReference['default'];
    const answerStatus = this.get('answer.result');

    if (answerStatus && (answerStatus in contentReference)) {
      resultItem = contentReference[answerStatus];
    }
    return resultItem;
  }),

  resultItemIcon: computed('resultItem', function() {
    return resultIconUrl(this.get('resultItem.status'));
  })
});
