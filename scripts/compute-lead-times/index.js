const { computeLeadTimes } = require('./compute-lead-times');
const { getRefNames, getTagDate, getCommitDatesBetweenTags } = require('./get-git-dates');
const { csvFormat: jsonToCsv } = require('d3-dsv');

async function main() {
  const refNames = await getRefNames();

  const leadTimesPromises = refNames.map(async (tag, index) => {
    const olderTag = refNames[index + 1];
    if (!olderTag) return [];

    const tagDateString = await getTagDate(tag);
    const commitDateStrings = await getCommitDatesBetweenTags(olderTag, tag);
    const leadTimes = computeLeadTimes(tagDateString, commitDateStrings);
    leadTimes.forEach((leadTime) => leadTime.tagName = tag);
    return leadTimes;
  });
  const leadTimes = await Promise.all(leadTimesPromises);
  const leadTimesJS = leadTimes.flat(1);
  const csv = jsonToCsv(leadTimesJS);
  console.log(csv);
}

main();
