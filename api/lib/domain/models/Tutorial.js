const TYPES = {
  RECOMMENDED: 'recommended',
  SAVED: 'saved',
};

class Tutorial {
  constructor({ id, duration, format, link, source, title } = {}) {
    this.id = id;
    this.duration = duration;
    this.format = format;
    this.link = link;
    this.source = source;
    this.title = title;
  }
}

Tutorial.TYPES = TYPES;

export default Tutorial;
