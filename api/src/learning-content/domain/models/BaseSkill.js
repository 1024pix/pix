export class BaseSkill {
  constructor(cachedSkillDto) {
    this._cachedSkillDto = cachedSkillDto;
  }

  get id() {
    return this._cachedSkillDto.id;
  }

  get name() {
    return this._cachedSkillDto.name;
  }

  get difficulty() {
    return this._cachedSkillDto.level;
  }

  get tubeId() {
    return this._cachedSkillDto.tubeId;
  }

  get competenceId() {
    return this._cachedSkillDto.competenceId;
  }
}
