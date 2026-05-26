class UserRecommendedTraining {
  constructor({
    id,
    title,
    link,
    type,
    duration,
    locales,
    editorName,
    editorLogoUrl,
    deliveryMode,
    registrationRequired,
    program,
    objectives,
    description,
  } = {}) {
    this.id = id;
    this.title = title;
    this.link = link;
    this.type = type;
    this.duration = { ...duration }; // Prevent use of PostgresInterval object
    this.locales = locales;
    this.editorName = editorName;
    this.editorLogoUrl = editorLogoUrl;
    this.deliveryMode = deliveryMode;
    this.registrationRequired = registrationRequired;
    this.program = program;
    this.objectives = objectives;
    this.description = description;
  }
}

export { UserRecommendedTraining };
