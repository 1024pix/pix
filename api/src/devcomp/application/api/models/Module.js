export class Module {
  constructor({ id, shortId, slug, title, duration, image, level, description, objectives }) {
    this.id = id;
    this.shortId = shortId;
    this.slug = slug;
    this.title = title;
    this.duration = duration;
    this.image = image;
    this.level = level;
    this.description = description;
    this.objectives = objectives;
  }
}
