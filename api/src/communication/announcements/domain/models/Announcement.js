export class Announcement {
  constructor({ name, content }) {
    this.id = name;
    this.content = content ?? null;
  }
}
