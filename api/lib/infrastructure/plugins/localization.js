const Localization = {
  name: 'localization-plugin',

  reset() {
  },

  register: async function(server, options) {
    server.ext('onPreHandler', function(request, h) {
      request.localization = request.url.hostname;
      return h.continue;
    });
  }
};

module.exports = Localization;
