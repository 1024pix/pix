import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  include: ['tutorials', 'learningMoreTutorials'],
});
