const cronContent = {
  jobs: [],
};

if (process.env.CACHE_RELOAD_TIME) {
  const cacheReloadJob = {
    command: `${process.env.CACHE_RELOAD_TIME} pnpm run cache:refresh`,
  };
  if (process.env.CACHE_RELOAD_CONTAINER_SIZE) {
    cacheReloadJob.size = process.env.CACHE_RELOAD_CONTAINER_SIZE;
  }
  cronContent.jobs.push(cacheReloadJob);
}

console.log(JSON.stringify(cronContent));
