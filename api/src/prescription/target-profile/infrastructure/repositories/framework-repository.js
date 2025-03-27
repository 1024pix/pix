import { Framework } from '../../domain/read-models/Framework.js';

export async function list({ frameworksApi }) {
  const frameworkDTOs = await frameworksApi.list();
  return frameworkDTOs.map((frameworkDTO) => new Framework(frameworkDTO));
}
