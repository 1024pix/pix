module.exports = {
  async notify() {
    return {
      isSuccessful: false,
      code: 'SENDING-DISABLED',
    };
  },
};
