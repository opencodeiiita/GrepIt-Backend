# GrepIt

A Rapid-Fire / Trivia website to test your Bash, HTML, and JS skills (and more!)
"Grep" from your knowledge and score more to be on top of a leaderboard!

## Tech Stack:

-   Nodejs (v21.2.0)
-   ExpressJS
-   MongoDB

## Dependencies:

You need npm/yarn installed in your local machine in order to run this app.

## How To Setup

-   Make sure your machine is having internet connection.
-   Open shell (which ever your OS support) on your PC.
-   Change drive to the location where you want your project to be copied.
-   Clone it to your local setup by using command git clone `<repo link>`.
-   Once cloned, Run the following command in the root directory of the project `npm install`.
-   Make sure you have required enviornment variables saved in the `.env` file in the root of the project. A file `.env.example` is attached for reference.
-   After the process is completed, run the command `npm start`.
-   The backend will be live on `localhost:4000`.

## Installation:

```bash
  npm install
  npm start
```

## 🚀 How It Works:

-   Receive a prompt to enter a command or HTML tag or JS keywords.
-   Race against time to input the correct response.
-   Earn points for accuracy and speed.

## 🌐 Features:

-   Diverse challenges covering bash commands, HTML tags, and more.
-   Real-time scoring and leaderboard for competitive fun.
-   Educational and entertaining for beginners and experts alike.
-   Helps brush up your grasp on these topics.
-   Helps you "Grep" these commands from your knowledge-base!
-   Attempt to beat your own high-score, and practice for the same in the customizable practice-space! It's not always about competing everytime...

## Reference Links:

-   [Download and install the latest version of Git.](https://git-scm.com/downloads)
-   [Set your username in Git.](https://help.github.com/articles/setting-your-username-in-git)
-   [Set your commit email address in Git.](https://help.github.com/articles/setting-your-commit-email-address-in-git)
-   [Setup Nodejs](https://nodejs.org/en/blog/release/v16.18.1/)

## Directory Structure:

```
.
├── app.js
├── package.json
├── package-lock.json
├── README.md
└── src
    ├── config
    │   └── db.config.js
    ├── controllers
    │   └── userAuth.controllers.js
    ├── middlewares
    │   └── userAuth.middleware.js
    └── routes
        └── v1
            └── userAuth.routes.js

6 directories, 8 files
```

## Claim an issue:

Comment on the issue. In case of no activity on the issue even after 2 days, the issue will be reassigned. If you have difficulty approaching the issue, feel free to ask on our discord channel.

## Communication:

Whether you are working on a new feature or facing a doubt please feel free to ask us on our [discord](https://discord.gg/D9999YTkS8) channel. We will be happy to help you out.

## Guidelines:

Please help us follow the best practice to make it easy for the reviewer as well as the contributor. We want to focus on the code quality more than on managing pull request ethics.

-   People before code: If any of the following rules are violated, the pull-requests will be rejected. This is to create an easy and joyful onboarding process for new programmers and first-time contributors.

-   Single commit per pull request and name the commit as something meaningful, example: Adding <-your-name-> in students/mentors section.

-   Reference the issue numbers in the commit message if it resolves an open issue. Follow the pattern provided in `.github/pull_request_template.md`

-   Provide the link to live gh-pages from your forked repository or relevant screenshot for easier review.

-   Pull Request older than 3 days with no response from the contributor shall be marked closed.

-   Avoid duplicate PRs, if need be comment on the older PR with the PR number of the follow-up (new PR) and close the obsolete PR yourself.

-   Be polite: Be polite to other community members.

