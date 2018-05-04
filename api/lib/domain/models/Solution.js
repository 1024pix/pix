class Solution {

  /**
   *
   * @param id: id de la ligne Epreuve AirTable dont est extraite l'information de la Solution
   * @param type: type de l'épreuve
   * @param value: Bonne réponse attendue.
   * @param isT1Enabled: T1 - Espaces, casse & accents
   * @param isT2Enabled: T2 - Ponctuation
   * @param isT3Enabled: T3 - Distance d'édition
   * @param scoring: ??
   *
   * Les traitements T1, T2 et T3 sont les traitements qu'il est possible d'utiliser pour valider une réponse.
   * Pour plus d'informations, ne pas hésiter à se reporter aux explications présentes dans AirTable.
   */
  constructor({
    id, type, value, isT1Enabled = false, isT2Enabled = false, isT3Enabled = false, scoring
  } = {}) {
    this.id = id;
    this.type = type;
    this.value = value;
    this.isT1Enabled = isT1Enabled;
    this.isT2Enabled = isT2Enabled;
    this.isT3Enabled = isT3Enabled;
    this.scoring = scoring;
  }

  get enabledTreatments() {
    const enabledTreatments = [];
    if (this.isT1Enabled) {
      enabledTreatments.push('t1');
    }
    if (this.isT2Enabled) {
      enabledTreatments.push('t2');
    }
    if (this.isT3Enabled) {
      enabledTreatments.push('t3');
    }
    return enabledTreatments;
  }

  // TODO: delete when deactivation object is correctly deleted everywhere
  /**
   * @deprecated use the enabledTreatments property
   */
  get deactivations() {
    return {
      t1: !this.enabledTreatments.includes('t1'),
      t2: !this.enabledTreatments.includes('t2'),
      t3: !this.enabledTreatments.includes('t3')
    };
  }
}

module.exports = Solution;
