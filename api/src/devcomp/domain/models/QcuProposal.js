import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class QcuProposal {
  constructor({ id, content }) {
    assertNotNullOrUndefined(id, "L'id est obligatoire pour une proposition de QCU");
    assertNotNullOrUndefined(content, 'Le contenu est obligatoire pour une proposition de QCU');

    this.id = id;
    this.content = content;
  }
}

export { QcuProposal };
