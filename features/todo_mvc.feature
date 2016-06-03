@focus
Feature: TODO MVC

  As a Developer using the API Mocking Step Definitions
  I want to be able to mock api endpoints anywhere on the
  web.

  Background:
    Given I visit "http://gcloud-todos.appspot.com/examples/angularjs/#/"

    # the mvc app seems to use relative paths, so in order
    # to match requests we provide the empty string as api root
    And I start mocking ""

  Scenario: The app queries the backend for Todos
    Then a "get" to "/api/todos" should have happened

  Scenario: The app displays the initial todos

    Given the API responds to a "get" on "/api/todos" with "200":
    """
      [
        {
          "completed": false,
          "title": "Task 1",
          "id": 5701886678138880
        },
        {
          "completed": false,
          "title": "Task 2",
          "id": 5701886678138880
        }
      ]
    """
    Then a Todo "Task 1" should be visible
    And a Todo "Task 2" should be visible

  Scenario: Creating a Todo

    When I input "My fancy new Todo" into the Todo Input
    And I press Return

    Then a "post" to "/api/todos" should have happened with:
    """
      {
        "title": "My fancy new Todo",
        "completed": false
      }
    """
    Given the API responds to the "post" on "/api/todos" with "201":
    """
      {
        "id": 5701886678138880,
        "title": "My fancy new Todo",
        "completed": false
      }
    """
    Then an active Todo "My fancy new Todo" should be visible

  @focus
  Scenario: Filtering Todos
    Given the API responds to a "get" on "/api/todos" with "200":
    """
      [{
        "id": 5701886678138880,
        "title": "Todo 1",
        "completed": false
      },
      {
        "id": 5701886678138882,
        "title": "Todo 2",
        "completed": true
      }]
    """

    Then an active Todo "Todo 1" should be visible
    And a completed Todo "Todo 2" should be visible

    When I click on the "Completed" Link
    Then an active Todo "Todo 1" should not be visible
    And a completed Todo "Todo 2" should be visible

    When I click on the "Active" Link
    Then an active Todo "Todo 1" should be visible
    And a completed Todo "Todo 2" should not be visible
    Then I click on the "All" Link

  Scenario: Toggling Todo States
    Given the API responds to a "get" on "/api/todos" with "200":
    """
      [{
        "id": 5701886678138880,
        "title": "My fancy new Todo",
        "completed": false
      }]
    """
    And an active Todo "My fancy new Todo" should be visible

    When I click on the toggle Botton of "My fancy new Todo"
    Then a "put" to "/api/todos/5701886678138880" should have happened with:
    """
      {
        "id": 5701886678138880,
        "title": "My fancy new Todo",
        "completed": true
      }
    """

    # shiny dynamic magic step
    Then a completed Todo "My fancy new Todo" should be visible
    And an active Todo "My fancy new Todo" should not be visible

    Given the API responds to the "put" on "/api/todos/5701886678138880" with "201":
    """
      {
        "id": 5701886678138880,
        "title": "My fancy new Todo",
        "completed": true
      }
    """
    And the API responds to a "get" on "/api/todos" with "200":
    """
      [{
        "id": 5701886678138880,
        "title": "My fancy new Todo",
        "completed": true
      }]
    """

    When I click on the "Completed" Link
    # shiny dynamic magic step
    Then a completed Todo "My fancy new Todo" should be visible
    And an active Todo "My fancy new Todo" should not be visible

    When I click on the toggle Botton of "My fancy new Todo"
    And the API responds to a "get" on "/api/todos" with "200":
    """
      [{
        "id": 5701886678138880,
        "title": "My fancy new Todo",
        "completed": false
      }]
    """

    Then a Todo "My fancy new Todo" should not be visible

    When I click on the "Active" Link
    Then an active Todo "My fancy new Todo" should be visible
