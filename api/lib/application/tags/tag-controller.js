const _ = require('lodash');
const usecases = require('../../domain/usecases');

module.exports = {

  async findAllOrganizationsTags() {
    const organizationsTags = await usecases.findAllOrganizationsTags();
    return null;
  },
};
