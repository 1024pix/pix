module.exports = {
  description: 'create domain class infrastructure adapter file and test',
  prompts: [{
    type: 'input',
    name: 'name',
    message: 'domain class name please (ex: Skill)'
  }],
  actions: [
    {
      type: 'add',
      path: 'lib/infrastructure/adapters/{{kebabCase name}}-adapter.js',
      templateFile: './plop/templates/adapter/adapter.hbs'
    },
    {
      type: 'add',
      path: 'tests/unit/infrastructure/adapters/{{kebabCase name}}-adapter_test.js',
      templateFile: './plop/templates/adapter/adapter_test.hbs'
    }
  ]
};
