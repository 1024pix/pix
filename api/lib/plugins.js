const plugins = [{register: require('blipp')}];

plugins.push({
  register: require('good'),
  options: {
    reporters: {
      console: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{
          response: '*',
          log: '*'
        }]
      }, {
        module: 'good-console'
      }, 'stdout']
    }
  }
});

module.exports = plugins;
