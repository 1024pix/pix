/**
 * @function
 * @returns {Promise<Array<StructureCategory>>}
 */
const findAllStructureCategories = async function ({ structureCategoryRepository }) {
  return structureCategoryRepository.findAll();
};

export { findAllStructureCategories };
