import ApplicationSerializer from './application';

const include = ['banners'];

export default ApplicationSerializer.extend({
  include,
});
