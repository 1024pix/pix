import ApplicationSerializer from './application';

const _include = ['competences'];

export default ApplicationSerializer.extend({
  include: _include,
});
