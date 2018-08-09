module.exports = {
  description: 'create usecase file and test',
  prompts: [{
    type: 'input',
    name: 'name',
    message: 'usecase name please (ex: get-user-information)'
  }],
  actions: [
    {
      type: 'add',
      path: 'lib/domain/usecases/{{name}}.js',
      templateFile: './plop/templates/usecase.hbs'
    },
    {
      type: 'modify',
      path: 'lib/domain/usecases/index.js',
      pattern: '};\n',
      template: "  {{camelCase name}}: require('./{{name}}.js'),\n};\n"
    },
    {
      type: 'add',
      path: 'tests/unit/domain/usecases/{{name}}_test.js',
      templateFile: './plop/templates/usecase_test.hbs'
    }
  ]
};
