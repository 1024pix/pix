export const replications = [
  {
    name: 'sco_certification_results',
    before: async ({ datamartKnex }) => {
      await datamartKnex('sco_certification_results').truncate();
    },
    from: ({ datawarehouseKnex }) => {
      return datawarehouseKnex('data_export_parcoursup_certif_result').select(
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
      );
    },
    to: ({ datamartKnex }, chunk) => {
      return datamartKnex('sco_certification_results').insert(chunk);
    },
  },
  {
    name: 'certification_results',
    before: async ({ datamartKnex }) => {
      await datamartKnex('certification_results').truncate();
    },
    from: ({ datawarehouseKnex }) => {
      return datawarehouseKnex('data_export_parcoursup_certif_result_code_validation').select(
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
      );
    },
    to: ({ datamartKnex }, chunk) => {
      return datamartKnex('certification_results').insert(chunk);
    },
  },
  {
    name: 'tdb_num_back_to_school_campaigns_statistics',
    before: async ({ datamartKnex }) => {
      await datamartKnex('tdb_num_back_to_school_campaigns_statistics').truncate();
    },
    from: ({ datawarehouseKnex }) => {
      return datawarehouseKnex('data_sco_edupilot')
        .select(
          'uai',
          'annee_scolaire',
          'academie_nom',
          'etablissement',
          'departement',
          'niveau_scolaire',
          'code_competence',
          'nom_competence',
          'nombre_eleves_distinct',
          'ecart_type',
          'decile_10',
          'quartile_25',
          'quartile_50',
          'quartile_75',
          'decile_90',
          'niveau_maximum_moyen_atteint',
          'niveau_maximum_moyen_atteignable',
          'couverture',
          'date_derniere_mise_a_jour',
        )
        .as(
          'schoolUai',
          'schoolYear',
          'academieName',
          'schoolName',
          'provinceCode',
          'schoolYearGroup',
          'competenceCode',
          'competenceName',
          'participantCount',
          'standardDeviation',
          'firstDecileLevel',
          'firstQuartileLevel',
          'medianLevel',
          'thirdQuartileLevel',
          'ninthDecileLevel',
          'averageMaxLevelReached',
          'averageMaxLevelReachable',
          'coverage',
          'updatedAt',
        );
    },
    to: ({ datamartKnex }, chunk) => {
      return datamartKnex('tdb_num_back_to_school_campaigns_statistics').insert(chunk);
    },
  },
  {
    name: 'tdb_num_certification_statistics',
    before: async ({ datamartKnex }) => {
      await datamartKnex('tdb_num_certification_statistics').truncate();
    },
    from: ({ datawarehouseKnex }) => {
      return datawarehouseKnex('data_sco_edupilot_lot_2')
        .select(
          'uai',
          'annee_scolaire',
          'academie_nom',
          'etablissement',
          'departement',
          'niveau_scolaire',
          'total_certification_obtenues',
          'total_certifications',
          'moyenne_score',
          'competence_code',
          'avg_competence_level',
          'date_derniere_mise_a_jour',
        )
        .as(
          'schoolUai',
          'schoolUai',
          'schoolYear',
          'academieName',
          'schoolName',
          'provinceCode',
          'schoolYearGroup',
          'validatedCertificationCount',
          'certificationCount',
          'averagePixScore',
          'competenceCode',
          'avgCompetenceLevel',
          'updatedAt',
        );
    },
    to: ({ datamartKnex }, chunk) => {
      return datamartKnex('tdb_num_certification_statistics').insert(chunk);
    },
  },
  {
    name: 'organizations_cover_rates',
    before: async ({ datamartKnex }) => {
      await datamartKnex('organizations_cover_rates').truncate();
    },
    from: ({ datawarehouseKnex }) => {
      return datawarehouseKnex('data_pro_campaigns_kpi_aggregated').select(
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
      );
    },
    to: ({ datamartKnex }, chunk) => {
      return datamartKnex('organizations_cover_rates').insert(chunk);
    },
  },
  {
    name: 'target_profiles_course_duration',
    before: async ({ datamartKnex }) => {
      await datamartKnex('target_profiles_course_duration').truncate();
    },
    from: ({ datawarehouseKnex }) => {
      return datawarehouseKnex('data_target_profiles_course_duration').select(
        'targetProfileId',
        'median',
        'quantile_75',
        'quantile_95',
      );
    },
    to: ({ datamartKnex }, chunk) => {
      return datamartKnex('target_profiles_course_duration').insert(chunk);
    },
  },
  {
    name: 'data-calibrations',
    before: async ({ datamartKnex }) => {
      await datamartKnex('data_calibrations').truncate();
    },
    from: ({ datawarehouseKnex }) => {
      return datawarehouseKnex('data_calibrations').select('id', 'calibration_date', 'status', 'scope');
    },
    to: ({ datamartKnex }, chunk) => {
      return datamartKnex('data_calibrations').insert(chunk);
    },
  },
  {
    name: 'data-active-calibrated-challenges',
    before: async ({ datamartKnex }) => {
      await datamartKnex('data_active_calibrated_challenges').truncate();
    },
    from: ({ datawarehouseKnex }) => {
      return datawarehouseKnex('data_active_calibrated_challenges').select(
        'challenge_id',
        'alpha',
        'delta',
        'calibration_id',
      );
    },
    to: ({ datamartKnex }, chunk) => {
      return datamartKnex('data_active_calibrated_challenges').insert(chunk);
    },
  },
];

export function getByName(name, dependencies = { replications }) {
  return dependencies.replications.find((replication) => replication.name === name);
}
