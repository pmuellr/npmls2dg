contributing to this project
================================================================================

Awesome!  We're happy that you want to contribute.

Make sure that you're read and understand the [Code of Conduct].

Here are the general guidelines for contributing:

* For any bug you want to fix, or feature you want to add, make sure there's
  an issue describing the bug or feature.

  * Make sure there is some discussion with the current contributors so that
    folks understand the design of your bug fix or new feature.  It would suck
    if you spent a lot of time on something that didn't get included in the
    project - but of course feel free to fork this project if your contribution
    isn't accepted!

* Create a feature branch in your own clone of this repo (for folks without
  r/w access to the main repo), and then issue a pull request for that
  branch on the main repo.

  * PRs should be single-focused, and not include any "drive-by patches".

  * PRs should include tests (if code was changed) and docs describing new
    behavior.

  * The final merge of a PR onto the master should be rebased and squashed.

  * The final commit message should be useful.  It should contain a link to the
    issue that it relates to.

* Ensure the existing tests - and your new tests - actually pass.

  * Tests can be run via `npm test` which runs the "built" project.

  * To build the project, run `npm run build` which builds out the
    `web-resources` directory, which the tests may test against.

  * You probably want to run `npm run watch` while developing; it will run
    builds, then run the tests, then start the server.  When a source change
    is saved, the process starts all over.

* Never force push to the master branch.  Force pushing to bug / feature
  branches is both fine and expected.

[Code of Conduct]: CODE_OF_CONDUCT.md
