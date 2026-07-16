import { Framework } from './Framework.js';

export class FrameworkWithAreas extends Framework {
  /**
   * @param {{
   *   id: string
   *   name: string
   *   areas: Area[]
   * }}
   */
  constructor({ id, name, areas }) {
    super({ id, name });
    this.areas = areas;
  }
}
