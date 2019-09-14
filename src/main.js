const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

async function run() {
  try {
    const GITHUB_TOKEN = core.getInput("github-token", { required: true });
    const {
      payload: { repository },
      sha
    } = github.context;

    const repoDetails = {
      owner: repository.owner.name,
      repo: repository.name
    };

    const PIVOTAL_TOKEN = core.getInput("pivotal-token", { required: true });

    const request = axios.create({
      baseURL: `https://www.pivotaltracker.com/services/v5`,
      timeout: 2000,
      headers: { "X-TrackerToken": PIVOTAL_TOKEN }
    });

    const getPivotalId = branch => {
      const match = branch.match(/\d{9}/);
      if (match && match.length) {
        return match[0];
      }
      return "";
    };

    const getStoryDetails = async storyId => {
      return await request.get(`/stories/${storyId}`).then(res => res.data);
    };

    const getProjectDetails = async projectId => {
      return await request.get(`/projects/${projectId}`).then(res => res.data);
    };

    const addLabels = async (client, prNumber, label) => {
      try {
        await client.issues.addLabels({
          ...repoDetails,
          issue_number: prNumber,
          labels: [label]
        });
      } catch (error) {
        console.log(error);
      }
    };

    const getPrNumber = async () => {
      const {
        data: pulls
      } = await client.repos.listPullRequestsAssociatedWithCommit({
        ...repoDetails,
        commit_sha: sha
      });
      const [pullRequest] = pulls;
      if (pullRequest) {
        return pullRequest.number;
      }
      return undefined;
    };

    const checkPivotal = async () => {
      const { ref } = github.context;
      const pivotalId = getPivotalId(ref);
      console.log("Log: pivotalId ", pivotalId);

      if (!pivotalId) {
        core.setFailed("Pivotal id is missing in your branch.");
      }

      const storyDetails = await getStoryDetails(pivotalId);
      const { project_id, id } = storyDetails;
      if (id && project_id) {
        const project = await getProjectDetails(project_id);
        const { name } = project;
        return name || false;
      } else {
        core.setFailed(
          "Invalid pivotal story id. Please create a branch with a valid pivotal story"
        );
        return false;
      }
    };

    const projectName = await checkPivotal();
    console.log("Log: -> projectName ", projectName);
    if (!projectName) {
      core.setFailed("Could not get project name from the pivotal id");
    }
    const prNumber = await getPrNumber();
    if (!prNumber) {
      core.setFailed("Could not get pull request number from context, exiting");
    }
    const client = new github.GitHub(GITHUB_TOKEN);
    // Jarvis POD -> jarvis
    const label = projectName.split(" ")[0].toLowerCase();
    addLabels(client, prNumber, label);
    core.setFailed("fail to try rerun");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
