import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class BlockSelectOption {
  constructor({ id, content }) {
    assertNotNullOrUndefined(id, "L'id est obligatoire pour une option de bloc select");
    assertNotNullOrUndefined(content, 'Le contenu est obligatoire pour une option de bloc select');

    this.id = id;
    this.content = content;
  }
}

export { BlockSelectOption };
