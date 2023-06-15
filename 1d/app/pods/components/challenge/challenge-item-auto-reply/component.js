import Component from '@glimmer/component';

export default class ChallengeItemAutoReply extends Component {
  postMessageHandler = null;
  embedOrigins = 'https://epreuves.pix.fr,https://1024pix.github.io'.split(',');

  constructor() {
    super(...arguments);
    this._addEventListener();
  }

  _addEventListener() {
    this.postMessageHandler = this._receiveEmbedMessage.bind(this);
    window.addEventListener('message', this.postMessageHandler);
  }

  _receiveEmbedMessage(event) {
    const message = this._getMessageFromEventData(event);
    if (message && message.answer && message.from === 'pix') {
      this.args.setAnswerValue(message.answer);
    }
  }

  _getMessageFromEventData(event) {
    let data = null;
    const isAllowedOrigin = this.allowedOriginWithRegExp.some((allowedOrigin) => {
      return event.origin.match(allowedOrigin);
    });
    if (isAllowedOrigin) {
      if (this._isNumeric(event.data)) {
        data = this._transformToObjectMessage(event.data);
      } else if (typeof event.data === 'string') {
        try {
          data = JSON.parse(event.data);
        } catch {
          data = this._transformToObjectMessage(event.data);
        }
      } else if (typeof event.data === 'object') {
        data = event.data;
      }
    }
    return data;
  }

  _isNumeric(x) {
    return parseFloat(x).toString() === x;
  }

  _transformToObjectMessage(answer) {
    return { answer: answer, from: 'pix' };
  }

  willDestroy() {
    window.removeEventListener('message', this.postMessageHandler);
    super.willDestroy();
  }

  get allowedOriginWithRegExp() {
    return this.embedOrigins.map((allowedOrigin) => {
      return new RegExp(allowedOrigin.replace('*', '[\\w-]+'));
    });
  }
}
