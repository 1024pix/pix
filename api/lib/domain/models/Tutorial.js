class Tutorial {

  constructor({
    id,
    // attributes
    duration,
    format,
    link,
    source,
    title
    // embedded
    // relations
  } = {}) {
    this.id = id;
    // attributes
    this.duration = duration;
    this.format = format;
    this.link = link;
    this.source = source;
    this.title = title;
    // embedded
    // relations
  }
}

module.exports = Tutorial;
