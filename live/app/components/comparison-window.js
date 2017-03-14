import Ember from 'ember';

const contentReference = {
  ok: {
    title: 'Vous avez la bonne réponse !',
    titleTooltip: 'Réponse correcte',
    path: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z',
    color: '#30d5b0'
  },

  ko: {
    title: 'Vous n\'avez pas donné de réponse',
    titleTooltip: 'Réponse incorrecte',
    path: 'M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z',
    color: '#ff4600'
  },

  aband: {
    title: 'Vous n\'avez pas la bonne réponse',
    titleTooltip: 'Sans réponse',
    path: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M8,8L13,12L8,16M14,8H16V16H14',
    color: '#3e4149'
  },

  partially: {
    title: 'Vous avez donné une réponse partielle',
    titleTooltip: 'Réponse partielle',
    path: 'M941,28.7873535 C944.182598,28.7873535 947.234845,30.0516356 949.485281,32.3020721 C951.735718,34.5525087 953,37.6047556 953,40.7873535 C953,47.4147705 947.627417,52.7873535 941,52.7873535 C937.817402,52.7873535 934.765155,51.5230714 932.514719,49.2726349 C930.264282,47.0221983 929,43.9699514 929,40.7873535 C929,37.6047556 930.264282,34.5525087 932.514719,32.3020721 C934.765155,30.0516356 937.817402,28.7873535 941,28.7873535 L941,28.7873535 Z',
    color: '#ffffff',
    custom: true
  },

  timedout: {
    title: 'Vous avez dépassé le temps imparti',
    titleTooltip: 'Temps dépassé',
    path: 'M11,17A1,1 0 0,0 12,18A1,1 0 0,0 13,17A1,1 0 0,0 12,16A1,1 0 0,0 11,17M11,3V7H13V5.08C16.39,5.57 19,8.47 19,12A7,7 0 0,1 12,19A7,7 0 0,1 5,12C5,10.32 5.59,8.78 6.58,7.58L12,13L13.41,11.59L6.61,4.79V4.81C4.42,6.45 3,9.05 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M18,12A1,1 0 0,0 17,11A1,1 0 0,0 16,12A1,1 0 0,0 17,13A1,1 0 0,0 18,12M6,12A1,1 0 0,0 7,13A1,1 0 0,0 8,12A1,1 0 0,0 7,11A1,1 0 0,0 6,12Z',
    color: '#ff0000'
  },

  default: {
    title: '',
    titleTooltip: 'Correction automatique en cours de développement ;)',
    path: 'M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z',
    color: '#446eff'
  }

};

const ComparisonWindow = Ember.Component.extend({

  answer: null,
  challenge: null,
  solution: null,
  index: null,

  isAssessmentChallengeTypeQroc: Ember.computed.equal('challenge.type', 'QROC'),
  isAssessmentChallengeTypeQcm: Ember.computed.equal('challenge.type', 'QCM'),
  isAssessmentChallengeTypeQrocm: Ember.computed.equal('challenge.type', 'QROCM'),
  isAssessmentChallengeTypeQrocmInd: Ember.computed.equal('challenge.type', 'QROCM-IND'),
  isAssessmentChallengeTypeQrocmDep: Ember.computed.equal('challenge.type', 'QROCM-DEP'),

  resultItemContent: Ember.computed('answer.result', function () {
    if (!this.get('answer.result')) return;
    const answerStatus = this.get('answer.result');
    return (answerStatus in contentReference)? contentReference[answerStatus] : '';
  })

});

ComparisonWindow.reopenClass({
  positionalParams: ['answer', 'challenge', 'solution', 'index']
});

export default ComparisonWindow;
