import ApplicationSerializer from './application';

const include = ['subscriptions'];

export default ApplicationSerializer.extend({
  include,
});
