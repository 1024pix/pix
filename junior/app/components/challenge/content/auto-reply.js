import Component from '@glimmer/component';
import { isEmbedAllowedOrigin } from 'junior/utils/embed-allowed-origins';

export default class AutoReply extends Component {
  postMessageHandler = null;

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
    // console.log(event);
    if (message && message.answer && message.from === 'pix') {
      if (this.args.isEmbedAutoValidated) {
        this.args.setAnswerValue(message.answer);
        this.args.validateAnswer();
        this.args.setShouldDisableVerifyButton(false);
      } else {
        this.args.setAnswerValue(message.answer);
      }
    }
  }

  _getMessageFromEventData(event) {
    let data = null;
    if (!isEmbedAllowedOrigin(event.origin)) return null;
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
}
