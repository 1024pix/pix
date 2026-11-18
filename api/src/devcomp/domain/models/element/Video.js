import { Element } from './Element.js';

class Video extends Element {
  constructor({ id, title, url, subtitles, transcription, poster }) {
    super({ id, type: 'video' });

    this.url = url;
    this.title = title;
    this.subtitles = subtitles;
    this.transcription = transcription;
    this.poster = poster ?? null;
  }
}

export { Video };
