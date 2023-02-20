import buildArea from './build-area';
import Framework from '../../../../lib/domain/models/Framework';

export default function buildFramework({ id = 'recFramework123', name = 'Mon super référentiel', areas } = {}) {
  areas = areas || [buildArea({ frameworkId: id })];
  const framework = new Framework({
    id,
    name,
    areas,
  });

  areas.forEach((area) => {
    area.frameworkId = id;
  });
  return framework;
}
