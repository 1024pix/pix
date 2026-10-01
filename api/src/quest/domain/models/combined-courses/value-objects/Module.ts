export type ModuleType = {
  id: string;
  title: string;
  slug: string;
  duration: number;
  image: string;
  shortId: string;
  level: string;
  description: string;
  objectives: string[];
};

export class Module {
  id: string;
  title: string;
  slug: string;
  duration: number;
  image: string;
  shortId: string;
  level: string;
  description: string;
  objectives: string[];

  constructor({ id, title, slug, duration, image, shortId, level, description, objectives }: ModuleType) {
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
