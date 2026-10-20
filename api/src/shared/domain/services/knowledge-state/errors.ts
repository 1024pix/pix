export class UnknownSkillsError extends Error {
  skillIds: string[];

  constructor(skillIds: string[]) {
    super(`Knowledge elements reference skills unknown to the learning content: ${skillIds.join(', ')}`);
    this.name = 'UnknownSkillsError';
    this.skillIds = skillIds;
  }
}
