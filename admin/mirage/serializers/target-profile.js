import ApplicationSerializer from './application';

const _includes = ['skills'];

export default ApplicationSerializer.extend({
  include: _includes,
});
