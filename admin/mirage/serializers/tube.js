import ApplicationSerializer from './application';

const include = ['skills'];

export default ApplicationSerializer.extend({
  include,
});
