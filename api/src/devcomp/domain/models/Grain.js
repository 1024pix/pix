import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class Grain {
  constructor({ id, introduction, content }) {
    assertNotNullOrUndefined(id, "L'id est obligatoire pour un grain");

    this.id = id;
    this.introduction = introduction;
    this.content = content;
  }
}

export { Grain };
