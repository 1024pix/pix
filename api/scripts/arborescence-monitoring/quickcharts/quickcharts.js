function generateChartUrl(conf, version, replaceTokens = {}) {
  const backgroundColor = 'snow';
  let stringifiedChartConfiguration = JSON.stringify(conf);

  Object.keys(replaceTokens).forEach((token) => {
    stringifiedChartConfiguration = stringifiedChartConfiguration.replace(`"$${token}"`, replaceTokens[token]);
  });

  const encodedChartConfiguration = encodeURIComponent(stringifiedChartConfiguration);
  return `https://quickchart.io/chart?c=${encodedChartConfiguration}&backgroundColor=${backgroundColor}&version=${version}`;
}

export { generateChartUrl };
