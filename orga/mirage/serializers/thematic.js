import ApplicationSerializer from './application';

const _include = ['tubes'];

export default ApplicationSerializer.extend({
  include: _include,
});
