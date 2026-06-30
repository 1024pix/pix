import { usecases } from '../../domain/usecases/index.js';
import { moduleMetadataSerializer } from '../../infrastructure/serializers/jsonapi/module-metadata-serializer.js';

async function getAllModulesMetadata() {
  const modulesMetadata = await usecases.getModuleMetadataList();

  return moduleMetadataSerializer.serialize(modulesMetadata);
}

const moduleMetadataController = {
  getAllModulesMetadata,
};

export { moduleMetadataController };
