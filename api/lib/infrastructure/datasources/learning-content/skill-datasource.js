const _ = require('lodash');
const datasource = require('./datasource.js');

const ACTIVE_STATUS = 'actif';
const OPERATIVE_STATUSES = ['actif', 'archivé'];

module.exports = datasource.extend({
  modelName: 'skills',

  async findActive() {
    const skills = await this.list();
    return _.filter(skills, { status: ACTIVE_STATUS });
  },

  async findOperative() {
    const skills = await this.list();
    return _.filter(skills, (skill) => _.includes(OPERATIVE_STATUSES, skill.status));
  },

  async findByRecordIds(skillIds) {
    const skills = await this.list();
    return skills.filter((skillData) => _.includes(skillIds, skillData.id));
  },

  async findOperativeByRecordIds(skillIds) {
    const skills = await this.list();
    return skills.filter(
      (skillData) => _.includes(OPERATIVE_STATUSES, skillData.status) && _.includes(skillIds, skillData.id)
    );
  },

  async findActiveByTubeId(tubeId) {
    const skills = await this.list();
    return _.filter(skills, { status: ACTIVE_STATUS, tubeId });
  },

  async findOperativeByTubeId(tubeId) {
    const skills = await this.list();
    return _.filter(skills, (skill) => skill.tubeId === tubeId && _.includes(OPERATIVE_STATUSES, skill.status));
  },

  async findActiveByCompetenceId(competenceId) {
    const skills = await this.list();
    return _.filter(skills, { status: ACTIVE_STATUS, competenceId });
  },

  async findOperativeByCompetenceId(competenceId) {
    const skills = await this.list();
    return _.filter(
      skills,
      (skill) => skill.competenceId === competenceId && _.includes(OPERATIVE_STATUSES, skill.status)
    );
  },

  async findOperativeByCompetenceIds(competenceIds) {
    const skills = await this.list();
    return _.filter(
      skills,
      (skill) => competenceIds.includes(skill.competenceId) && _.includes(OPERATIVE_STATUSES, skill.status)
    );
  },
});
