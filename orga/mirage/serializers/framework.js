import ApplicationSerializer from './application';

const _include = ['areas'];

export default ApplicationSerializer.extend({
  include: _include,
});
