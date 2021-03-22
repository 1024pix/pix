import resultIconUrl from 'mon-pix/utils/result-icon-url';
import Component from '@glimmer/component';

const TRANSLATION_PREFIX = 'pages.comparison-window.results.';
const TEXT_FOR_RESULT = {
  ok: { status: 'ok' },
  ko: { status: 'ko' },
  aband: { status: 'aband' },
  partially: { status: 'partially' },
  timedout: { status: 'timedout' },
  okAutoReply: { status: 'ok' },
  koAutoReply: { status: 'ko' },
  abandAutoReply: { status: 'aband' },
  default: { status: 'default' },
};

function _getTextForResult(result) {
  return {
    status: TEXT_FOR_RESULT[result].status,
    title: `${TRANSLATION_PREFIX}${result}.title`,
    tooltip: `${TRANSLATION_PREFIX}${result}.tooltip`,
  };
}

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

  get answerSuffix() {
    return this._isAutoReply ? 'AutoReply' : '';
  }

  get resultItem() {
    let resultItem = _getTextForResult('default');
    const answerStatus = `${this.args.answer.result}${this.answerSuffix}`;

    if (answerStatus && (answerStatus in TEXT_FOR_RESULT)) {
      resultItem = _getTextForResult(answerStatus);
    }
    return resultItem;
  }

  get resultItemIcon() {
    return resultIconUrl(this.resultItem.status);
  }

  get solution() {
    return this._isAutoReply ? null : this.args.answer.correction.get('solution');
  }

  get solutionToDisplay() {
    return this.args.answer.correction.get('solutionToDisplay');
  }

  get _isAutoReply() {
    return this.args.answer.challenge.get('autoReply');
  }
}

