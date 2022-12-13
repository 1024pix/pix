import ApplicationSerializer from './application';

const include = ['thematics'];

export default ApplicationSerializer.extend({
  include,
});
