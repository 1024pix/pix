import ApplicationSerializer from './application';

const relationshipsToInclude = ['organization'];

export default ApplicationSerializer.extend({
  include: relationshipsToInclude,
});
