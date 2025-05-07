/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  return await knex.raw(` \
        update public."mission-assessments" \
        set result = ('{"steps": ["reached", "partially-reached"], "global": "partially-reached"}'::jsonb) \
        where result::jsonb = ('{"steps": ["reached", "partially-reached"], "global":"not-reached"}'::jsonb)`
    )
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  return await knex.raw(` \
        update public."mission-assessments" \
        set result = ('{"steps": ["reached", "partially-reached"], "global":"not-reached"}'::jsonb) \
        where result::jsonb = ('{"steps": ["reached", "partially-reached"], "global": "partially-reached"}'::jsonb);`)
}

export { down, up };
