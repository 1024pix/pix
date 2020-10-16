import ApplicationSerializer from './application';

const _includes = ['schoolingRegistrations'];

export default ApplicationSerializer.extend({

  include: _includes,
});
