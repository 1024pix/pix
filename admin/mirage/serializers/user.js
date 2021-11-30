import ApplicationSerializer from './application';

const _includes = ['schoolingRegistrations', 'authenticationMethods'];

export default ApplicationSerializer.extend({
  include: _includes,
});
