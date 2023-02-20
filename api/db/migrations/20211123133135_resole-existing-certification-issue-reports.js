export const up = async function (knex) {
  await knex.raw(`UPDATE "certification-issue-reports"
                  SET  "resolvedAt" = NOW()
                  WHERE id IN
                  (
                      SELECT r.id FROM "certification-issue-reports" r
                          INNER JOIN "certification-courses" c ON c.id = r."certificationCourseId"
                          INNER JOIN "sessions" s ON s.id = c."sessionId"
                      WHERE 1=1
                        AND s."finalizedAt" IS NOT NULL
                        AND r."resolvedAt" IS NULL
                  )`);
};

export const down = function () {
  return;
};
