export class ModuleMetadata {
  constructor({ id, shortId, slug, title, isBeta, duration, image, visibility, level, description, objectives }) {
    this.id = id;
    this.shortId = shortId;
    this.slug = slug;
    this.title = title;
    this.isBeta = isBeta;
    this.duration = Number(duration);
    this.image = image;
    this.link = `/modules/${this.shortId}/${this.slug}`;
    this.visibility = visibility;
    this.level = level;
    this.description = description;
    this.objectives = objectives;
  }
}
