import ApplicationSerializer from './application';

const relationshipsToInclude = ['memberships', 'userOrgaSettings'];

export default ApplicationSerializer.extend({
  include: relationshipsToInclude,
});
