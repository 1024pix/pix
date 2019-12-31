import ApplicationSerializer from './application';

const relationshipsToInclude = ['certificationCenter'];

export default ApplicationSerializer.extend({
  include: relationshipsToInclude
});
