let plugins = [{ register: require('blipp') }];

if (process.env.NODE_ENV === 'test') {

  plugins.push({ register: require('inject-then') });

} else {

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
}

module.exports = plugins;
