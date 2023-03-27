import ApplicationSerializer from './application';

const relationshipsToInclude = ['competenceResults'];

export default ApplicationSerializer.extend({
  include: relationshipsToInclude,
});
