function isUniqConstraintViolated(err) {
  const PGSQL_UNIQ_CONSTRAINT = '23505';

  return err.code === PGSQL_UNIQ_CONSTRAINT;
}

function foreignKeyConstraintViolated(err) {
  const PGSQL_FK_CONSTRAINT = '23503';

  return err.code === PGSQL_FK_CONSTRAINT;
}

function getChunkSizeForParameterBinding(objectAboutToBeBinded, offset) {
  // PostgreSQL allows a maximum of 65536 binded parameters in prepared statements
  const MAX_BINDED_PARAMS_PG = 65536;
  if (objectAboutToBeBinded) {
    const numberOfParametersAvailable = MAX_BINDED_PARAMS_PG - offset - 1;
    return Math.floor(numberOfParametersAvailable / Object.keys(objectAboutToBeBinded).length);
  }
  return MAX_BINDED_PARAMS_PG;
}

module.exports = {
  isUniqConstraintViolated,
  foreignKeyConstraintViolated,
  getChunkSizeForParameterBinding,
};
