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
    name: 'men_dashboard_participation_dataset',
    before: async ({ datamartKnex }) => {
      await datamartKnex('men_dashboard_participation_dataset').truncate();
    },
    from: ({ datawarehouseKnex }) => {
      return datawarehouseKnex('data_sco_edupilot').select({
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
      });
    },
    to: ({ datamartKnex }, chunk) => {
      return datamartKnex('men_dashboard_participation_dataset').insert(chunk);
    },
  },
  {
    name: 'men_dashboard_certification_dataset',
    before: async ({ datamartKnex }) => {
      await datamartKnex('men_dashboard_certification_dataset').truncate();
    },
    from: ({ datawarehouseKnex }) => {
      return datawarehouseKnex('data_sco_edupilot_lot_2').select({
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
      });
    },
    to: ({ datamartKnex }, chunk) => {
      return datamartKnex('men_dashboard_certification_dataset').insert(chunk);
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
