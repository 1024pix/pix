/**
 * A full refresh of `target` (datamart table) from `source` (datawarehouse table).
 * `columns` is either a list of column names shared by source and target, or a
 * `{ target: source }` mapping (knex select aliasing).
 */
export type Replication = {
  readonly source: string;
  readonly target: string;
  readonly columns: readonly string[] | Readonly<Record<string, string>>;
};

export const replications = Object.freeze({
  sco_certification_results: {
    source: 'data_export_parcoursup_certif_result',
    target: 'sco_certification_results',
    columns: [
      'national_student_id',
      'organization_uai',
      'last_name',
      'first_name',
      'birthdate',
      'status',
      'pix_score',
      'certification_date',
      'competence_level',
      'competence_name',
      'competence_code',
      'area_name',
      'certification_courses_id',
      'configuration',
    ],
  },
  certification_results: {
    source: 'data_export_parcoursup_certif_result_code_validation',
    target: 'certification_results',
    columns: [
      'certification_code_verification',
      'last_name',
      'first_name',
      'birthdate',
      'status',
      'pix_score',
      'certification_date',
      'competence_level',
      'competence_name',
      'competence_code',
      'area_name',
      'certification_courses_id',
      'configuration',
    ],
  },
  men_dashboard_participation_dataset: {
    source: 'data_sco_edupilot',
    target: 'men_dashboard_participation_dataset',
    columns: {
      schoolUai: 'uai',
      schoolYear: 'annee_scolaire',
      academieName: 'academie_nom',
      schoolName: 'etablissement',
      provinceCode: 'departement',
      schoolYearGroup: 'niveau_scolaire',
      competenceCode: 'code_competence',
      competenceName: 'nom_competence',
      participantCount: 'nombre_eleves_distinct',
      standardDeviation: 'ecart_type',
      firstDecileLevel: 'decile_10',
      firstQuartileLevel: 'quartile_25',
      medianLevel: 'quartile_50',
      thirdQuartileLevel: 'quartile_75',
      ninthDecileLevel: 'decile_90',
      averageMaxLevelReached: 'niveau_maximum_moyen_atteint',
      averageMaxLevelReachable: 'niveau_maximum_moyen_atteignable',
      coverage: 'couverture',
      updatedAt: 'date_derniere_mise_a_jour',
    },
  },
  men_dashboard_certification_dataset: {
    source: 'data_sco_edupilot_lot_2',
    target: 'men_dashboard_certification_dataset',
    columns: {
      schoolUai: 'uai',
      schoolYear: 'annee_scolaire',
      academieName: 'academie_nom',
      schoolName: 'etablissement',
      provinceCode: 'departement',
      schoolYearGroup: 'niveau_scolaire',
      validatedCertificationCount: 'total_certification_obtenues',
      certificationCount: 'total_certifications',
      averagePixScore: 'moyenne_score',
      competenceCode: 'competence_code',
      avgCompetenceLevel: 'avg_competence_level',
      updatedAt: 'date_derniere_mise_a_jour',
    },
  },
  organizations_cover_rates: {
    source: 'data_pro_campaigns_kpi_aggregated',
    target: 'organizations_cover_rates',
    columns: [
      'tag_name',
      'domain_name',
      'competence_code',
      'competence_name',
      'campaign_id',
      'target_profile_id',
      'orga_id',
      'tube_id',
      'tube_practical_title',
      'extraction_date',
      'max_level',
      'sum_user_max_level',
      'passage_count',
      'nb_tubes_in_competence',
    ],
  },
  target_profiles_course_duration: {
    source: 'data_target_profiles_course_duration',
    target: 'target_profiles_course_duration',
    columns: ['targetProfileId', 'median', 'quantile_75', 'quantile_95'],
  },
  data_calibrations: {
    source: 'data_calibrations',
    target: 'data_calibrations',
    columns: ['id', 'calibration_date', 'status', 'scope'],
  },
  data_active_calibrated_challenges: {
    source: 'data_active_calibrated_challenges',
    target: 'data_active_calibrated_challenges',
    columns: ['challenge_id', 'alpha', 'delta', 'calibration_id'],
  },
  data_scoring_meshes_all: {
    source: 'data_scoring_meshes_all',
    target: 'data_scoring_meshes_all',
    columns: ['id', 'calibration_id', 'status'],
  },
  data_scoring_meshes: {
    source: 'data_scoring_meshes',
    target: 'data_scoring_meshes',
    columns: ['scoring_meshes_all_id', 'mesh', 'min_bound_curated_value', 'max_bound_curated_value'],
  },
  data_scoring_thresholds_all: {
    source: 'data_scoring_thresholds_all',
    target: 'data_scoring_thresholds_all',
    columns: ['id', 'calibration_id', 'status'],
  },
  data_scoring_thresholds: {
    source: 'data_scoring_thresholds',
    target: 'data_scoring_thresholds',
    columns: [
      'scoring_thresholds_all_id',
      'level',
      'competence_id',
      'min_bound_curated_value',
      'max_bound_curated_value',
    ],
  },
} as const satisfies Record<string, Replication>);
