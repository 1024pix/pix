function generateChartUrl(conf, version) {
  const backgroundColor = 'snow';
  const encodedChartConfiguration = encodeURIComponent(JSON.stringify(conf));
  return `https://quickchart.io/chart?c=${encodedChartConfiguration}&backgroundColor=${backgroundColor}&version=${version}`;
}

export { generateChartUrl };
