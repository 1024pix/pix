import ApplicationSerializer from './application';

const include = ['tubes'];

export default ApplicationSerializer.extend({
  include,
});
