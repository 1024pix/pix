import { usecases } from '../../domain/usecases/index.js';
import { structureCategorySerializer } from '../../infrastructure/serializers/jsonapi/structure-category/structure-category-serializer.js';

const findAllCategories = async function (request, h, dependencies = { structureCategorySerializer }) {
  const structureCategories = await usecases.findAllStructureCategories();
  return dependencies.structureCategorySerializer.serialize(structureCategories);
};

const structureCategoriesController = { findAllCategories };

export { structureCategoriesController };
