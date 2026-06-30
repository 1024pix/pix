export class Training {
  constructor({
    id,
    title,
    internalTitle,
    link,
    type,
    duration,
    locales,
    targetProfileIds,
    editorName,
    editorLogoUrl,
    trainingTriggers,
    deliveryMode,
    registrationRequired,
    program,
    objectives,
    description,
  } = {}) {
    this.id = id;
    this.title = title;
    this.internalTitle = internalTitle;
    this.link = link;
    this.type = type;
    this.duration = { ...duration }; // Prevent use of PostgresInterval object
    this.locales = locales;
    this.targetProfileIds = targetProfileIds;
    this.editorName = editorName;
    this.editorLogoUrl = editorLogoUrl;
    this.trainingTriggers = trainingTriggers;
    this.deliveryMode = deliveryMode;
    this.registrationRequired = registrationRequired;
    this.program = program;
    this.objectives = objectives;
    this.description = description;
  }

  shouldBeObtained(knowledgeElements, skills) {
    if (this.trainingTriggers.length === 0) {
      return false;
    }

    return this.trainingTriggers.every((trainingTrigger) => trainingTrigger.isFulfilled({ knowledgeElements, skills }));
  }

  static modes = {
    HYBRID: 'hybrid',
    ONSITE: 'onSite',
    REMOTE: 'remote',
  };
}
