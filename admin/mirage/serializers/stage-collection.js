import ApplicationSerializer from './application';

const _includes = ['stages'];

export default ApplicationSerializer.extend({
  include: _includes,
});
