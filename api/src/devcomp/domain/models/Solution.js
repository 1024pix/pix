/**
 * Traduction: Correction
 * Context:    Objet existant dans le cadre de la correction d'une réponse pendant le fonctionnement
 *             interne de l'algorithme.
 */
class Solution {
  /**
   *
   * @param id: id de la ligne Épreuve du référentiel dont est extraite l'information de la Solution
   * @param isT1Enabled: T1 - Espaces, casse & accents
   * @param isT2Enabled: T2 - Ponctuation
   * @param isT3Enabled: T3 - Distance d'édition
   * @param type: type de l'épreuve
   * @param value: Bonne réponse attendue.
   *
   * Les tolérances T1, T2 et T3 sont les tolérances qu'il est possible d'utiliser pour valider une réponse.
   * Pour plus d'informations, ne pas hésiter à se reporter aux explications présentes dans pix-editor.
   */
  constructor({
    id,
    isT1Enabled = false,
    isT2Enabled = false,
    isT3Enabled = false,
    type,
    value,
    qrocBlocksTypes,
  } = {}) {
    this.id = id;
    this.isT1Enabled = isT1Enabled;
    this.isT2Enabled = isT2Enabled;
    this.isT3Enabled = isT3Enabled;
    this.type = type;
    this.value = value;
    this.qrocBlocksTypes = qrocBlocksTypes;
  }

  get enabledTolerances() {
    const enabledTolerances = [];
    if (this.isT1Enabled) {
      enabledTolerances.push('t1');
    }
    if (this.isT2Enabled) {
      enabledTolerances.push('t2');
    }
    if (this.isT3Enabled) {
      enabledTolerances.push('t3');
    }
    return enabledTolerances;
  }

  // TODO: delete when deactivation object is correctly deleted everywhere
  /**
   * @deprecated use the enabledTolerances property
   */
  get deactivations() {
    return {
      t1: !this.enabledTolerances.includes('t1'),
      t2: !this.enabledTolerances.includes('t2'),
      t3: !this.enabledTolerances.includes('t3'),
    };
  }
}

export { Solution };
