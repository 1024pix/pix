export class KnowledgeStateDTO {
  /**
   * @param {string[]} validatedSkillIds les acquis que l'état donne validés, au référentiel courant
   * @param {Object.<string, number>} floorByTubeId le plancher de chaque tube touché
   */
  constructor({ validatedSkillIds, floorByTubeId }) {
    this.validatedSkillIds = validatedSkillIds;
    this.floorByTubeId = floorByTubeId;
  }
}
