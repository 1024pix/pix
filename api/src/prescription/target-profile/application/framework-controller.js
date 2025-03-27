import { usecases } from '../domain/usecases/index.js';
import * as frameworkSerializer from '../infrastructure/serializers/jsonapi/framework-serializer.js';

export async function list() {
  const frameworks = await usecases.listFrameworks();
  return frameworkSerializer.serialize(frameworks);
}
