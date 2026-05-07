import { usecases } from '../../domain/usecases/index.js';
import { FrameworkDTO } from './models/FrameworkDTO.js';

/**
 * @param {{ ids: string[] }}
 */
export async function findByIds({ ids = [] }) {
  if (!ids?.length) return [];
  const frameworks = await usecases.findFrameworksByIds({ ids });
  return frameworks.map(toDTO);
}

function toDTO(framework) {
  return new FrameworkDTO(framework);
}
