import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class ElementAnswer {
  constructor({ id, elementId, userResponseValue, correction }) {
    assertNotNullOrUndefined(elementId, "L'id de l'élément est obligatoire pour une réponse d'élément");
    assertNotNullOrUndefined(
      userResponseValue,
      "La réponse de l'utilisateur est obligatoire pour une réponse d'élément",
    );
    assertNotNullOrUndefined(correction, "La correction est obligatoire pour une réponse d'élément");

    this.id = id;
    this.elementId = elementId;
    this.userResponseValue = userResponseValue;
    this.correction = correction;
  }
}

export { ElementAnswer };
