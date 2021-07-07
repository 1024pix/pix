const usecases = require('../../domain/usecases');

module.exports = {

  async sendEmailForAccountRecovery(request, h) {
    const userId = request.payload.data.attributes['user-id'];
    const email = request.payload.data.attributes.email;

    await usecases.sendEmailForAccountRecovery({ userId, email });

    return h.response({ data: { type: 'account-recovery-demands' } }).created();
  },

};
