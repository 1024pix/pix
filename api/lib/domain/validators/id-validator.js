const { idSpecification } = require('./id-specification');

const validateIds = function(request) {

  const params = Object.getOwnPropertyNames(request.params);
  const idParams = params.filter((param) => { param === 'id' || param.includes('Id'); });
  idParams.map((id) => {
    const { error } = idSpecification.validate(request.params[id]);
    if (error) {
      throw new Error(`invalid ID: ${id} - ${request.params[id]}`);
    }
  });

};

module.exports = { validateIds };
