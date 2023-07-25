async function team1dDataBuilder({ databaseBuilder }) {
  _createActivity(databaseBuilder);
}

export { team1dDataBuilder };

function _createActivity(databaseBuilder) {
  databaseBuilder.factory.buildActivity();
}
