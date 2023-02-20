import Competence from '../../../../../../lib/infrastructure/serializers/jsonapi/certifications-livret-scolaire/response-objects/Competence';
import { buildAreaForLS } from '../../../../../../lib/infrastructure/serializers/jsonapi/certifications-livret-scolaire/factory/build-area-for-ls';

export default function buildCompetenceForLS({ id, name, area = buildAreaForLS() } = {}) {
  return new Competence({
    id,
    name,
    area,
  });
}
