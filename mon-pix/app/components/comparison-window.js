import resultIconUrl from 'mon-pix/utils/result-icon-url';
import Component from '@glimmer/component';

const TEXT_FOR_RESULT = {
  ok: {
    status: 'ok',
    title: 'pages.comparison-window.results.ok.title',
    tooltip: 'pages.comparison-window.results.ok.tooltip'
  },

  ko: {
    status: 'ko',
    title: 'pages.comparison-window.results.ko.title',
    tooltip: 'pages.comparison-window.results.ko.tooltip'
  },

  aband: {
    status: 'aband',
    title: 'pages.comparison-window.results.aband.title',
    tooltip: 'pages.comparison-window.results.aband.tooltip'
  },

  partially: {
    status: 'partially',
    title: 'pages.comparison-window.results.partially.title',
    tooltip: 'pages.comparison-window.results.partially.tooltip'
  },

  timedout: {
    status: 'timedout',
    title: 'pages.comparison-window.results.timedout.title',
    tooltip: 'pages.comparison-window.results.timedout.tooltip'
  },

  okAutoReply: {
    status: 'ok',
    title: 'pages.comparison-window.results.okAutoReply.title',
    tooltip: 'pages.comparison-window.results.okAutoReply.tooltip'
  },

  koAutoReply: {
    status: 'ko',
    title: 'pages.comparison-window.results.koAutoReply.title',
    tooltip: 'pages.comparison-window.results.koAutoReply.tooltip'
  },

  abandAutoReply: {
    status: 'aband',
    title: 'pages.comparison-window.results.abandAutoReply.title',
    tooltip: 'pages.comparison-window.results.abandAutoReply.tooltip'
  },

  default: {
    status: 'default',
    title: 'pages.comparison-window.results.default.title',
    tooltip: 'pages.comparison-window.results.default.tooltip'
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

