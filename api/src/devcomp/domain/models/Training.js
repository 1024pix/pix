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
    trainingTriggers,
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
    this.trainingTriggers = trainingTriggers;
  }

  shouldBeObtained(knowledgeElements, skills) {
    if (this.trainingTriggers.length === 0) {
      return false;
    }

    return this.trainingTriggers.every((trainingTrigger) => trainingTrigger.isFulfilled({ knowledgeElements, skills }));
  }
}

export { Training };
