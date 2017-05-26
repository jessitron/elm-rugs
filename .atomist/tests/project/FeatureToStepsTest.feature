Feature: Make sure the sample TypeScript Editor has some tests
  This is the sample Gherkin feature file for the BDD tests of
  the generate the steps for our features.
  Feel free to modify and extend to suit the needs of your editor.


  Scenario: FeatureToSteps should edit a project correctly
    Given bana-na handler
    When the FeatureToSteps is run
    Then parameters were valid
    Then changes were made
    Then the hello file says hello
