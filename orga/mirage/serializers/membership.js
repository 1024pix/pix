import ApplicationSerializer from './application';

const relationshipsToInclude = ['organization', 'user'];

export default ApplicationSerializer.extend({
  include: relationshipsToInclude,
});
