export class Framework {
  /**
   * @param {{
   *   id: string
   *   name: string
   *   areas: import('./Area.js').Area[]
   * }}
   */
  constructor({ id, name, areas }) {
    this.id = id;
    this.name = name;
    this.areas = areas;
  }
}
