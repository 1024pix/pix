module.exports = {

  world: {
    handler: function (request, reply) {

      reply('Hello, world!');
    }
  },

  buddy: {
    handler: function (request, reply) {

      reply(`Hello, ${encodeURIComponent(request.params.name)}!`);
    }
  }
};
