import ApplicationSerializer from './application';

const include = ['areas'];

export default ApplicationSerializer.extend({
  include,
});
