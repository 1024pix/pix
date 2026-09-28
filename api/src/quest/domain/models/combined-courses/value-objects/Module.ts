export type ModuleType = {
  id: string;
  title: string;
  slug: string;
  duration: number;
  image: string;
  shortId: string;
};

export class Module {
  id: string;
  title: string;
  slug: string;
  duration: number;
  image: string;
  shortId: string;

  constructor({ id, title, slug, duration, image, shortId }: ModuleType) {
    this.id = id;
    this.title = title;
    this.slug = slug;
    this.duration = duration;
    this.image = image;
    this.shortId = shortId;
  }
}
