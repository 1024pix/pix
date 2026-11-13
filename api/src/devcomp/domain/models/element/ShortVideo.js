import { Element } from './Element.js';

class ShortVideo extends Element {
  constructor({ id, title, url, transcription }) {
    super({ id, type: 'short-video' });

    this.url = url;
    this.title = title;
    this.transcription = transcription;
  }
}

export { ShortVideo };
