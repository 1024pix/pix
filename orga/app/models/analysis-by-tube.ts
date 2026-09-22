import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';

export interface AnalysisByTubeRow {
  domaine: string;
  competence_code: string;
  competence: string;
  sujet: string;
  niveau_par_sujet: string;
  niveau_par_user: string;
  [extra: string]: unknown;
}

export default class AnalysisByTube extends Model {
  declare [Type]: 'analysis-by-tube';

  @attr() declare data: AnalysisByTubeRow[] | null;
}
