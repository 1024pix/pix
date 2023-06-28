class UserRecommendedTraining {
  constructor({ id, title, link, type, duration, locale, editorName, editorLogoUrl } = {}) {
    this.id = id;
    this.title = title;
    this.link = link;
    this.type = type;
    this.duration = { ...duration }; // Prevent use of PostgresInterval object
    this.locale = locale;
    this.editorName = editorName;
    this.editorLogoUrl = editorLogoUrl;
  }
}

export { UserRecommendedTraining };
