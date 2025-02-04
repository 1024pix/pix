import { Competence } from '../../../../../src/parcoursup/domain/read-models/Competence.js';

export const buildCompetence = function ({ code, name, areaName, level }) {
  return new Competence({ code, name, areaName, level });
};
