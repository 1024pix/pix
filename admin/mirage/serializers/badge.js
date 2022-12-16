import ApplicationSerializer from './application';

const include = ['criteria'];

export default ApplicationSerializer.extend({
  include,
});
