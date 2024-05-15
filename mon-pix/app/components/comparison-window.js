import Component from '@glimmer/component';

const TRANSLATION_PREFIX = 'pages.comparison-window.results.';
const TEXT_FOR_RESULT = {
  ok: { status: 'ok' },
  ko: { status: 'ko' },
  aband: { status: 'aband' },
  timedout: { status: 'timedout' },
  focusedOut: { status: 'ko' },
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
    return this.args.answer.challenge?.get('type') === 'QROC';
  }

  get isAssessmentChallengeTypeQcm() {
    return this.args.answer.challenge?.get('type') === 'QCM';
  }

  get isAssessmentChallengeTypeQcu() {
    return this.args.answer.challenge?.get('type') === 'QCU';
  }

  get isAssessmentChallengeTypeQrocm() {
    return this.args.answer.challenge?.get('type') === 'QROCM';
  }

  get isAssessmentChallengeTypeQrocmInd() {
    return this.args.answer.challenge?.get('type') === 'QROCM-ind';
  }

  get isAssessmentChallengeTypeQrocmDep() {
    return this.args.answer.challenge?.get('type') === 'QROCM-dep';
  }

  get answerSuffix() {
    return this._isAutoReply ? 'AutoReply' : '';
  }

  get resultItem() {
    if (!this.args.answer) {
      return '';
    }

    const answerStatus = `${this.args.answer.result}${this.answerSuffix}`;

    if (answerStatus && answerStatus in TEXT_FOR_RESULT) {
      return _getTextForResult(answerStatus);
    }

    return _getTextForResult('default');
  }

  get solution() {
    return this._isAutoReply ? null : this.args.answer.correction.get('solution');
  }

  get answersEvaluation() {
    return this.args.answer.correction.get('answersEvaluation');
  }

  get solutionsWithoutGoodAnswers() {
    return this.args.answer.correction.get('solutionsWithoutGoodAnswers');
  }

  get solutionToDisplay() {
    return this.args.answer.correction.get('solutionToDisplay');
  }

  get _isAutoReply() {
    return Boolean(this.args.answer.challenge?.get('autoReply'));
  }
}
