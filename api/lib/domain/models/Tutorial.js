class Tutorial {

  constructor(
    {
      duration,
      format,
      link,
      source,
      title
    } = {}) {
    this.duration = duration;
    this.format = format;
    this.link = link;
    this.source = source;
    this.title = title;
  }
}

module.exports = Tutorial;
