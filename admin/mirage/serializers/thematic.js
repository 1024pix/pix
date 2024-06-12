import ApplicationSerializer from './application';

const include = ['tubes', 'triggerTubes'];

export default ApplicationSerializer.extend({
  include,
});
