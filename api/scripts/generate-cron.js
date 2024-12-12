const cronContent = {
  jobs: [],
};

if (process.env.CACHE_RELOAD_TIME) {
  cronContent.jobs.push({
    command: `${process.env.CACHE_RELOAD_TIME} npm run cache:refresh`,
  });
}
console.log(JSON.stringify(cronContent));
