/**
 * Traduction: Correction
 * Context:    Objet existant dans le cadre de la correction d'une réponse pendant le fonctionnement
 *             interne de l'algorithme.
 */
class Solution {
  /**
   *
   * @param id: id de la ligne Épreuve du référentiel dont est extraite l'information de la Solution
   * @param tEnabled: bitmask (in32)
   *    * T1 - Espaces, casse & accents
   *    * T2 - Ponctuation
   *    * T3 - Distance d'édition
   * @param type: type de l'épreuve
   * @param value: Bonne réponse attendue.
   *
   * Les traitements T1, T2 et T3 sont les traitements qu'il est possible d'utiliser pour valider une réponse.
   * Pour plus d'informations, ne pas hésiter à se reporter aux explications présentes dans pix-editor.
   */
  constructor({
    id,
    tEnabled = 0,
    type,
    value,
    qrocBlocksTypes,
  } = {}) {
    this.id = id;
    this.tEnabled = tEnabled;
    this.type = type;
    this.value = value;
    this.qrocBlocksTypes = qrocBlocksTypes;
  }

  get enabledTreatments() {
    const enabledTreatments = [];
    for (let i = 0; i < 32; i++) {
      if ((0b1 << i) & this.tEnabled) {
        enabledTreatments.push(`t${i + 1}`);
      }
    }

    return enabledTreatments;
  }

  // TODO: delete when deactivation object is correctly deleted everywhere
  /**
   * @deprecated use the enabledTreatments property
   */
  get deactivations() {
    let res = {};
    for (let i = 0; i < 32; i++) {
      const tName = `t${i + 1}`;
      res[tName] = !this.enabledTreatments.includes(tName);
    }
    return res;
  }
}

export { Solution };
