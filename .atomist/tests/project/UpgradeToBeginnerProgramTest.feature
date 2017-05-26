Feature: Make sure the sample TypeScript Editor has some tests
  This is the sample Gherkin feature file for the BDD tests of
  the Turn a static page into an interactive page.
  Feel free to modify and extend to suit the needs of your editor.


  Scenario: UpgradeToBeginnerProgram should edit a project correctly
    Given an empty project
    When the UpgradeToBeginnerProgram is run
    Then parameters were valid
    Then changes were made
    Then the hello file says hello
