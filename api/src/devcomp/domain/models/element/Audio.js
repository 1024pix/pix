import { Element } from './Element.js';

class Audio extends Element {
  constructor({ id, title, url, transcription }) {
    super({ id, type: 'audio' });

    this.url = url;
    this.title = title;
    this.transcription = transcription;
  }
}

export { Audio };
