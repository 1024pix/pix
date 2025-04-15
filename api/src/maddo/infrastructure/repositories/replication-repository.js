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
      );
    },
    to: ({ datamartKnex }, chunk) => {
      return datamartKnex('certification_results').insert(chunk);
    },
  },
];

export function getByName(name, dependencies = { replications }) {
  return dependencies.replications.find((replication) => replication.name === name);
}
