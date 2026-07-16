import { FrameworkDTO } from './FrameworkDTO.js';

export default class LearningContentDTO extends FrameworkDTO {
  constructor({ id, name, areas }) {
    super({ id, name });
    this.areas = areas;
  }
}
