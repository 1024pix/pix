import ApplicationSerializer from './application';

const _includes = ['organization', 'user'];

export default ApplicationSerializer.extend({

  include: _includes
});
