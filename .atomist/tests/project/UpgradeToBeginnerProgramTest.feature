Feature: Make sure the sample TypeScript Editor has some tests
  This is the sample Gherkin feature file for the BDD tests of
  the Turn a static page into an interactive page.
  Feel free to modify and extend to suit the needs of your editor.


  Scenario: UpgradeToBeginnerProgram should edit a project correctly
    Given an empty project
    When running the StaticPage generator
    When adding a function that returns Html Never
    When the UpgradeToBeginnerProgram is run
    Then the type of main is Program Never Model Msg
    Then the type of that function is Html Msg
