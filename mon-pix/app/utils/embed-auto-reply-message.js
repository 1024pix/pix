import { isEmbedAllowedOrigin } from 'mon-pix/utils/embed-allowed-origins';

export function getAutoReplyMessage(event) {
  if (!isEmbedAllowedOrigin(event.origin)) return null;

  let message = null;

  if (_isNumeric(event.data)) {
    message = _toAnswerMessage(event.data);
  } else if (typeof event.data === 'string') {
    try {
      message = JSON.parse(event.data);
    } catch {
      message = _toAnswerMessage(event.data);
    }
  } else if (typeof event.data === 'object' && event.data !== null) {
    if (event.data.type && event.data.type !== 'answer') return null;
    message = event.data;
  }

  if (message == null || message.from !== 'pix') return null;
  return message;
}

function _isNumeric(value) {
  return parseFloat(value).toString() === value;
}

function _toAnswerMessage(answer) {
  return { answer, from: 'pix' };
}
