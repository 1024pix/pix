import { findByNames } from '../../../../learning-content/application/api/frameworks-api.js';
import { Framework } from '../../domain/read-models/Framework.js';

export async function list({ frameworksApi }) {
  const frameworkDTOs = await frameworksApi.list();
  return frameworkDTOs.map((frameworkDTO) => new Framework(frameworkDTO));
}

export async function getByName({ name, frameworksApi }) {
  const [frameworkDTO] = await frameworksApi.findByNames({ names: [name] });
  return new Framework(frameworkDTO);
}
