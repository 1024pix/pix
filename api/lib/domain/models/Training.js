class Training {
  constructor({ id, title, link, type, duration, locale, targetProfileIds } = {}) {
    this.id = id;
    this.title = title;
    this.link = link;
    this.type = type;
    this.duration = duration;
    this.locale = locale;
    this.targetProfileIds = targetProfileIds;
  }
}

module.exports = Training;
