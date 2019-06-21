import ApplicationSerializer from './application';

const _includes = ['organization', 'user', 'organizationRole'];

export default ApplicationSerializer.extend({

  include: _includes
});
