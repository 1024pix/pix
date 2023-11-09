import _ from 'lodash';
import * as datasource from './datasource.js';

const ACTIVE_STATUS = 'actif';
const IN_BUILD_STATUS = 'en construction';
const OPERATIVE_STATUSES = ['actif', 'archivé'];

const skillDatasource = datasource.extend({
  modelName: 'skills',

  async findActive() {
    const skills = await this.list();
    return _.filter(skills, { status: ACTIVE_STATUS });
  },

  async findAllSkillsByNameForPix1d(name) {
    const skills = await this.list();
    const filteredSkills = _.filter(skills, function (skill) {
      return _.isEqual(skill.name, name) && _.includes([ACTIVE_STATUS, IN_BUILD_STATUS], skill.status);
    });
    return filteredSkills;
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
      (skillData) => _.includes(OPERATIVE_STATUSES, skillData.status) && _.includes(skillIds, skillData.id),
    );
  },

  async findActiveByRecordIds(skillIds) {
    const skills = await this.list();
    return _.filter(skills, (skillData) => skillData.status === ACTIVE_STATUS && _.includes(skillIds, skillData.id));
  },

  async findByTubeIdFor1d(tubeId) {
    const skills = await this.list();
    return skills.filter(
      (skillData) =>
        _.includes([ACTIVE_STATUS, IN_BUILD_STATUS], skillData.status) && _.includes(tubeId, skillData.tubeId),
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
      (skill) => skill.competenceId === competenceId && _.includes(OPERATIVE_STATUSES, skill.status),
    );
  },

  async findOperativeByCompetenceIds(competenceIds) {
    const skills = await this.list();
    return _.filter(
      skills,
      (skill) => competenceIds.includes(skill.competenceId) && _.includes(OPERATIVE_STATUSES, skill.status),
    );
  },
});

export { skillDatasource, ACTIVE_STATUS };
