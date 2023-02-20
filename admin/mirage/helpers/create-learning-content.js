export function createLearningContent(server) {
  const framework_f1 = _createFramework(server, 'Pix');
  const area_f1_a1 = _createArea('area_f1_a1', framework_f1, server);
  const area_f1_a2 = _createArea('area_f1_a2', framework_f1, server);
  const competence_f1_a1_c1 = _createCompetence('competence_f1_a1_c1', area_f1_a1, server);
  const competence_f1_a1_c2 = _createCompetence('competence_f1_a1_c2', area_f1_a1, server);
  const competence_f1_a2_c1 = _createCompetence('competence_f1_a2_c1', area_f1_a2, server);
  const thematic_f1_a1_c1_th1 = _createThematic('thematic_f1_a1_c1_th1', competence_f1_a1_c1, server);
  const thematic_f1_a1_c1_th2 = _createThematic('thematic_f1_a1_c1_th2', competence_f1_a1_c1, server);
  const thematic_f1_a1_c2_th1 = _createThematic('thematic_f1_a1_c2_th1', competence_f1_a1_c2, server);
  const thematic_f1_a2_c1_th1 = _createThematic('thematic_f1_a2_c1_th1', competence_f1_a2_c1, server);
  _createTube('tube_f1_a1_c1_th1_tu1', true, false, thematic_f1_a1_c1_th1, server);
  _createTube('tube_f1_a1_c1_th1_tu2', false, true, thematic_f1_a1_c1_th1, server);
  _createTube('tube_f1_a1_c1_th2_tu1', true, true, thematic_f1_a1_c1_th2, server);
  _createTube('tube_f1_a1_c2_th1_tu1', true, true, thematic_f1_a1_c2_th1, server);
  _createTube('tube_f1_a2_c1_th1_tu1', true, true, thematic_f1_a2_c1_th1, server);
  const framework_f2 = _createFramework(server, 'Pix + Cuisine');
  const area_f2_a1 = _createArea('area_f2_a1', framework_f2, server);
  const competence_f2_a1_c1 = _createCompetence('competence_f2_a1_c1', area_f2_a1, server);
  const thematic_f2_a1_c1_th1 = _createThematic('thematic_f2_a1_c1_th1', competence_f2_a1_c1, server);
  _createTube('tube_f2_a1_c1_th1_tu1', false, false, thematic_f2_a1_c1_th1, server);
}

function _createFramework(server, name) {
  return server.create('framework', { name, areas: [] });
}

function _createArea(variableName, framework, server) {
  const area = server.create('area', {
    code: `${variableName} code`,
    title: `${variableName} title`,
    color: `${variableName} color`,
    frameworkId: framework.id,
    competences: [],
  });
  framework.update({ areas: [...framework.areas.models, area] });
  return area;
}

function _createCompetence(variableName, area, server) {
  const competence = server.create('competence', {
    name: `${variableName} name`,
    index: `${variableName} index`,
    areaId: area.id,
    thematics: [],
  });
  area.update({ competences: [...area.competences.models, competence] });
  return competence;
}

function _createThematic(variableName, competence, server) {
  const thematic = server.create('thematic', {
    name: `${variableName} name`,
    index: `${variableName} index`,
    tubes: [],
  });
  competence.update({ thematics: [...competence.thematics.models, thematic] });
  return thematic;
}

function _createTube(variableName, mobile, tablet, thematic, server) {
  const tube = server.create('tube', {
    id: variableName,
    name: `${variableName} name`,
    practicalTitle: `${variableName} practicalTitle`,
    practicalDescription: `${variableName} practicalDescription`,
    mobile,
    tablet,
    skills: [],
    competenceId: null,
  });
  thematic.update({ tubes: [...thematic.tubes.models, tube] });
  return tube;
}
