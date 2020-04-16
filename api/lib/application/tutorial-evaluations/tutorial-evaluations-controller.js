const usecases = require('../../domain/usecases');

module.exports = {

  async evaluate(request, h) {
    const { userId } = request.auth.credentials;
    const { tutorialId } = request.params;

    await usecases.addTutorialEvaluation({ userId, tutorialId });

    return h.response({ data: { type: 'tutorial-evaluations' } }).created();
  },

};
