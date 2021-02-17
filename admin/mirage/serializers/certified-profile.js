import ApplicationSerializer from './application';

const _includes = ['certifiedAreas', 'certifiedCompetences', 'certifiedTubes', 'certifiedSkills'];

export default ApplicationSerializer.extend({
  include: _includes,
});
