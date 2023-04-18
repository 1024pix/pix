import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ChallengeItemGeneric from '../challenge-item-generic/component';

export default class ChallengeItemAutoReply extends ChallengeItemGeneric {
  @tracked autoReplyAnswer = '';
  postMessageHandler = null;
  embedOrigins = 'https://epreuves.pix.fr,https://1024pix.github.io'.split(',');

  constructor() {
    super(...arguments);
    this._addEventListener();
  }

  _getAnswerValue() {
    return this.autoReplyAnswer;
  }

  _addEventListener() {
    this.postMessageHandler = this._receiveEmbedMessage.bind(this);
    window.addEventListener('message', this.postMessageHandler);
  }

  _receiveEmbedMessage(event) {
    const message = this._getMessageFromEventData(event);
    if (message && message.answer && message.from === 'pix') {
      this.autoReplyAnswer = message.answer;
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

  @action
  removeEmbedAutoEventListener() {
    window.removeEventListener('message', this.postMessageHandler);
  }

  get allowedOriginWithRegExp() {
    return this.embedOrigins.map((allowedOrigin) => {
      return new RegExp(allowedOrigin.replace('*', '[\\w-]+'));
    });
  }
}
