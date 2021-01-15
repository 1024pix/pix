import ApplicationSerializer from './application';

const _includes = ['areas', 'competences', 'tubes', 'skills'];

export default ApplicationSerializer.extend({
  include: _includes,
});
