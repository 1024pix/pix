import ApplicationSerializer from './application';

const _include = ['thematics'];

export default ApplicationSerializer.extend({
  include: _include,
});
