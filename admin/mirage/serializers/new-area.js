import ApplicationSerializer from './application';

const include = ['competences'];

export default ApplicationSerializer.extend({
  include,
});
