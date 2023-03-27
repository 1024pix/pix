import ApplicationSerializer from './application';

const relationshipsToInclude = ['userOrgaSettings'];

export default ApplicationSerializer.extend({
  include: relationshipsToInclude,
});
