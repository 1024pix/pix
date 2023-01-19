class Training {
  constructor({
    id,
    title,
    link,
    type,
    duration,
    locale,
    targetProfileIds,
    editorName,
    editorLogoUrl,
    prerequisiteThreshold,
    goalThreshold,
  } = {}) {
    this.id = id;
    this.title = title;
    this.link = link;
    this.type = type;
    this.duration = { ...duration }; // Prevent use of PostgresInterval object
    this.locale = locale;
    this.targetProfileIds = targetProfileIds;
    this.editorName = editorName;
    this.editorLogoUrl = editorLogoUrl;
    this.prerequisiteThreshold = prerequisiteThreshold;
    this.goalThreshold = goalThreshold;
  }
}

module.exports = Training;
