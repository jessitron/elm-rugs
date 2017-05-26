Feature: Make sure the sample TypeScript Editor has some tests
  This is the sample Gherkin feature file for the BDD tests of
  the generate the steps for our features.
  Feel free to modify and extend to suit the needs of your editor.


  Scenario: FeatureToSteps should edit a project correctly
    Given a project with a feature file
    Given some of the steps are defined
    When the FeatureToSteps editor is run
    Then all the steps are defined
