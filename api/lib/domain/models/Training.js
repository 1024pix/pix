class Training {
  constructor({ id, title, link, type, duration, locale, targetProfileIds, editorName, editorLogoUrl, triggers } = {}) {
    this.id = id;
    this.title = title;
    this.link = link;
    this.type = type;
    this.duration = { ...duration }; // Prevent use of PostgresInterval object
    this.locale = locale;
    this.targetProfileIds = targetProfileIds;
    this.editorName = editorName;
    this.editorLogoUrl = editorLogoUrl;
    this.triggers = triggers;
  }
}

module.exports = Training;
