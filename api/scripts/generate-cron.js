const cronContent = {
  jobs: [],
};

if (process.env.CACHE_RELOAD_TIME) {
  cronContent.jobs.push({
    command: `${process.env.CACHE_RELOAD_TIME} npm run cache:refresh`,
  });
}

cronContent.jobs.push({ command: '*/10 * * * * node test.js' });

console.log(JSON.stringify(cronContent));
