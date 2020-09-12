const fetch = require("node-fetch");
const fs = require("fs");

const ENDPOINT = "https://api.github.com/graphql";
const token = fs.readFileSync(".token").toString();
const query = fs.readFileSync("query.graphql").toString();
const mutation = fs.readFileSync("unsubscribe.graphql").toString();
const ONE_YEAR_AGO = new Date();
ONE_YEAR_AGO.setFullYear(ONE_YEAR_AGO.getFullYear() - 1);
console.log("One year ago", ONE_YEAR_AGO.toISOString());

fetch(ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "bearer " + token,
  },
  body: JSON.stringify({ query }),
})
  .then((r) => r.json())
  .then((data) => {
    console.log("data returned");
    inspectWatchedRepos(data);
  });

function inspectWatchedRepos(data) {
  const {
    data: {
      viewer: {
        login: myself,
        watching: { nodes: repos },
      },
    },
  } = data;
  for (let repo of repos) {
    if (repo.owner.login === myself) continue;
    console.log(repo);
    if (repo.isArchived) {
      unwatch(repo.id);
    }
    if(repo.pushedAt<ONE_YEAR_AGO.toISOString()){
      unwatch(repo.id);
    }
  }
}

function unwatch(repositoryId) {
  const variables = { repositoryId };
  return fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "bearer " + token,
    },
    body: JSON.stringify({
      query: mutation,
      variables: JSON.stringify(variables),
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      console.log("Unwatched");
      console.log(JSON.stringify(data, null, 2));
    });
}
