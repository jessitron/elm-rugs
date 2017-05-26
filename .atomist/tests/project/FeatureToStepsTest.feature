Feature: Automate the outline of steps from this feature file
  These feature files contain steps. It's fine to write them here
  but then you have to c&p the text of each one into Steps.this
  and that gets annoying. This editor will do that for you.


  Scenario: FeatureToSteps should edit a project correctly
    Given a project with a feature file
    Given some of the steps are defined
    When the FeatureToSteps editor is run
    Then all the steps are defined
