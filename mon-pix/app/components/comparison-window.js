import resultIconUrl from 'mon-pix/utils/result-icon-url';
import Component from '@glimmer/component';

const TEXT_FOR_RESULT = {
  ok: {
    status: 'ok',
    title: 'Vous avez la bonne réponse !',
    tooltip: 'Réponse correcte'
  },

  ko: {
    status: 'ko',
    title: 'Vous n’avez pas la bonne réponse',
    tooltip: 'Réponse incorrecte'
  },

  aband: {
    status: 'aband',
    title: 'Vous n’avez pas donné de réponse',
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

  okAutoReply: {
    status: 'ok',
    title: 'Vous avez réussi l’épreuve',
    tooltip: 'Épreuve réussie'
  },

  koAutoReply: {
    status: 'ko',
    title: 'Vous n’avez pas réussi l’épreuve',
    tooltip: 'Épreuve non réussie'
  },

  abandAutoReply: {
    status: 'aband',
    title: 'Vous avez passé l’épreuve',
    tooltip: 'Épreuve passée'
  },

  default: {
    status: 'default',
    title: '',
    tooltip: 'Correction automatique en cours de développement ;)'
  }
};

export default class ComparisonWindow extends Component {
  get isAssessmentChallengeTypeQroc() {
    return this.args.answer.challenge.get('type') === 'QROC';
  }

  get isAssessmentChallengeTypeQcm() {
    return this.args.answer.challenge.get('type') === 'QCM';
  }

  get isAssessmentChallengeTypeQcu() {
    return this.args.answer.challenge.get('type') === 'QCU';
  }

  get isAssessmentChallengeTypeQrocm() {
    return this.args.answer.challenge.get('type') === 'QROCM';
  }

  get isAssessmentChallengeTypeQrocmInd() {
    return this.args.answer.challenge.get('type') === 'QROCM-ind';
  }

  get isAssessmentChallengeTypeQrocmDep() {
    return this.args.answer.challenge.get('type') === 'QROCM-dep';
  }

  get isAutoReply() {
    return this.args.answer.challenge.get('autoReply');
  }

  get answerSuffix() {
    return this.isAutoReply ? 'AutoReply' : '';
  }

  get resultItem() {
    let resultItem = TEXT_FOR_RESULT['default'];
    const answerStatus = `${this.args.answer.result}${this.answerSuffix}`;

    if (answerStatus && (answerStatus in TEXT_FOR_RESULT)) {
      resultItem = TEXT_FOR_RESULT[answerStatus];
    }
    return resultItem;
  }

  get resultItemIcon() {
    return resultIconUrl(this.resultItem.status);
  }
}

