class UserRecommendedTraining {
  constructor({ id, title, link, type, duration, locale } = {}) {
    this.id = id;
    this.title = title;
    this.link = link;
    this.type = type;
    this.duration = { ...duration }; // Prevent use of PostgresInterval object
    this.locale = locale;
  }
}

module.exports = UserRecommendedTraining;
