# pivotal-lint 🧹

> A light-weight lint workflow when using GitHub along with [PivotalTracker][pivotal] for project management. Works well when used alongside [pivotal-flow][pivotal-flow].

![GitHub package.json version](https://img.shields.io/github/package-json/v/cleartax/pivotal-lint?style=flat-square) [![GitHub](https://img.shields.io/github/license/cleartax/pivotal-flow?style=flat-square)](https://github.com/cleartax/pivotal-flow/blob/master/LICENSE.md)

<!-- toc -->

- [Features](#features)
- [Usage](#usage)
- [Contributing](#contributing)
- [FAQ](#faq)

<!-- tocstop -->

## Features

### PR Status Checks

`pivotal-lint` adds a status check which helps you avoid merging PRs which are missing a valid story ID in the branch name. It will use the [PivotalTracker API](https://www.pivotaltracker.com/help/api/rest/v5#top) to validate a given story id.

### PR Description & Labels

#### Description

When a PR passes the above check, `pivotal-lint` will also add the story details to the top of the PR description. It will pick details such as the story title, type, points and labels and add them to the PR description.

#### Labels

`pivotal-lint` will automatically label PRs with:

- A _team name_ label based on the PivotalTracker Project name (the project the story belongs to). For example, if your project name is `Escher POD` then it will add `escher` as a label.
- `HOTFIX-PROD` - if the PR is raised against `production-release`.
- `HOTFIX-PRE-PROD` - if the PR is raised against `release/v*`.
- Pivotal story type (*feature*, *chore*, *bug*).

<figure>
 <img src="https://assets1.cleartax-cdn.com/cleargst-frontend/misc/1568800226_pr-lint.png" alt="Story details and labels added to a PR" />
 <figcaption>
 Story details and labels added to a PR [<a href="https://assets1.cleartax-cdn.com/cleargst-frontend/misc/1568800226_pr-lint.png">expand</a>].
 </figcaption>
</figure>

#### Soft-validations via comments

`pivotal-lint` will add comments to a PR to encourage better PR practices:

**A good PR title**

<figure>
  <img src="https://user-images.githubusercontent.com/6426069/69480647-6a6cfa00-0e2f-11ea-8750-4294f686dac7.png" />
  <figcaption>When the title of the PR is <strong>slightly different</strong> compared to the title of the story</figcaption>
</figure>

<figure>
  <img src="https://user-images.githubusercontent.com/6426069/69480647-6a6cfa00-0e2f-11ea-8750-4294f686dac7.png" />
  <figcaption>When the title of the PR is <strong>very different</strong>  compared to the title of the story</figcaption>
</figure>

**A comment discouraging PRs which are too large (based on number of lines of code changed).**

<figure>
  <img src="https://user-images.githubusercontent.com/6426069/69480043-e06e6280-0e29-11ea-8e24-173355c304dd.png" width="400" />
  <figcaption>Batman says no large PRs 🦇</figcaption>
</figure>

## Usage

To make pivotal-lint a part of your workflow, just add a `pivotal-lint.yml` file in your `.github/workflows/` directory in your GitHub repository.

```yml
name: pivotal-lint
 on: [pull_request]
 jobs:
  pivotal-lint:
    runs-on: ubuntu-latest
    steps:
    - uses: cleartax/pivotal-lint@master
      name: pivotal-lint
      with:
        github-token: ${{ secrets.GITHUB_ACCESS_TOKEN }}
        pivotal-token: ${{ secrets.PIVOTAL_TOKEN }}
        skip-branches: '^(production-release|master|release\/v\d+)$'
        skip-comments: true
        pr-threshold: 1000
```

It can also be used as part of an existing workflow by adding it as a step.

### Options

| key             | description                                                                                      | required | default |
| --------------- | ------------------------------------------------------------------------------------------------ | -------- | ------- |
| `github-token`  | Token used to update PR description. Must have write access to your repository.                  | true     | null    |
| `pivotal-token` | API Token used to fetch Pivotal Story information. Must have read access to your Pivotal boards. | true     | null    |
| `skip-branches` | A regex to ignore running PR lint on certain branches, like production etc.                      | false    | ' '     |
| `skip-comments` | A `Boolean` if set to `true` PR lint will skip adding lint comments for PR title.                | false    | false   |
| `pr-threshold`  | An `Integer` based on which PR lint will add commets for a huge PR.                              | false    | 800     |

Since tokens are private, we suggest adding them as [GitHub secrets](https://help.github.com/en/articles/virtual-environments-for-github-actions#creating-and-using-secrets-encrypted-variables).

### Skipping branches

Since GitHub actions take string inputs, `skip-branches` must be a regex which will work for all sets of branches you want to ignore. This is useful for merging protected/default branches into other branches. Check out some [examples in the tests](https://github.com/cleartax/pivotal-lint/blob/2bb72327ef04ab028caf84a099ffbc08b4dd0959/__tests__/utils.test.ts#L30-L41).

`pivotal-lint` already skips PRs which are filed by bots (for eg. [dependabot](https://github.com/marketplace/dependabot-preview)). You can add more bots to [this list](https://github.com/cleartax/pivotal-lint/blob/2bb72327ef04ab028caf84a099ffbc08b4dd0959/src/constants.ts#L4-L6), or add the branch-format followed by the bot PRs to the `skip-branches` option.

### Semantic Versions

If you want more stability in versions of `pivotal-lint` than `@master` you can also use the [semantic releases for pivotal-lint](https://github.com/cleartax/pivotal-lint/releases).

Example:

```yaml
# ...
    steps:
    - uses: cleartax/pivotal-lint@v2.1.0
      name: pivotal-lint
      # ...
```

## Contributing

Follow the instructions [here](https://help.github.com/en/articles/creating-a-javascript-action#commit-and-push-your-action-to-github) to know more about GitHub actions.

## FAQ

<details>
  <summary>Why is a PivotalTracker ID required in the branch names?</summary>

PivotalTracker ID is required in order to:

- Automate change-logs and release notes ⚙️.
- Automate alerts to QA/Product teams and other external stake-holders 🔊.
- Help us retrospect the sprint progress 📈.

</details>

<details>
  <summary>Is there a way to get around this?</summary>
  Nope 🙅

</details>

<details>
  <summary>Are there any tools to automate this?</summary>

Yes, check out [pivotal-flow][pivotal-flow] 🚀
</details>

[pivotal]: https://www.pivotaltracker.com/features
[pivotal-flow]: https://github.com/cleartax/pivotal-flow
