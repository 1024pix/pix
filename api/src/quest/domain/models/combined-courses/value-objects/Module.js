export class Module {
  constructor({ id, title, slug, duration, image, shortId, level, description, objectives }) {
    this.id = id;
    this.title = title;
    this.slug = slug;
    this.duration = duration;
    this.image = image;
    this.shortId = shortId;
    this.level = level;
    this.description = description;
    this.objectives = objectives;
  }
}
