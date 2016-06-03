Feature: API Mocking

  As a Developer using the API Mocking Step Definitions
  I want to be able to mock api endpoints.

  Scenario: Loading a Page/SPA without mocking
    Given I visit "../index.html"

    When I press the Button "superagent"
    Then the reponse displayed in "superagent" should be:
    """
      {
        "text": "An error occured"
      }
    """

    When I press the Button "reqwest"
    Then the reponse displayed in "reqwest" should be:
    """
      {
        "text": "an error occured"
      }
    """

  Scenario: Mocking away the API for superagent
    Given I visit "../index.html"

    # we just open a local file
    # but this could be anything
    # Given I visit "../index.html"

    # Loads the mocking facility (xhr-mock + request memory and more)
    # into the Browser and starts intercepting calls
    And I start mocking "http://localhost:8000"

    # look into the index.html for the script
    # that gets invoked here
    When I press the Button "superagent"

    # This call was remembered in the browser
    # there could have also been more in the meantime-
    Then a "post" to "/api/auth" should have happened with:
    """
      {
        "name": "admin",
        "password": "password"
      }
    """

    # We ask for the same post, this time also checking
    # for the headers
    Then a "post" to "/api/auth" should have happened with:
    """
      # Accept: application/json
      {
        "name": "admin",
        "password": "password"
      }
    """

    # Now we tell the mocking facility how to answer to
    # this post
    Given the API responds to the "post" on "/api/auth" with "200":
    """
      # X-Auth-Token: this is a secret token
      {
        "text": "hello, i come directly from a Gherkin Step"
      }
    """

    # The Fake API Response arrived and the js-mini-app
    # took measures to digest the response
    Then the reponse displayed in "superagent" should be:
    """
      {
        "text": "hello, i come directly from a Gherkin Step"
      }
    """

    # we display all the headers in the index js, content-
    # type is set automatically, but you may override it
    And the reponse displayed in "superagent-header" should be:
    """
      {
        "content-type": "application/json",
        "x-auth-token": "this is a secret token"
      }
    """

  Scenario: Mocking away the API for reqwest

    # And now for the reqwest lib
    When I press the Button "reqwest"

    # ...
    Then a "post" to "/api/posts" should have happened with:
    """
      {
        "title": "newest blog Post",
        "body": "long opinionated speach about smth. related to Development",
        "tags": "it, programming, zeitgeist",
        "author": "author"
      }
    """

    # This time we reply with an error code
    Given the API responds to the "post" on "/api/posts" with "401"

    # And the js-mini-app reacts
    Then the reponse displayed in "reqwest" should be:
    """
      {
        "text": "an error occured"
      }
    """

    # now we want to answer differently to a POST.
    # notice that we define the answer before the request here,
    # as we want to overwrite the "401" mock, that would still
    # get used by the mocking facility
    #
    # also we use js's 'eval' to get a little dynamic here by
    # creating a new Date and assigning it to self (the steps closure)
    Given the API responds to the "post" on "/api/posts" with "200":
    """
      {
        "id": 10,
        "created_at": "`self.date = new Date()`",
        "href": "http://my-fantastic-blog.org/newest_blog_post",
        "title": "newest blog Post",
        "body": "long opinionated speach about smth. related to Development",
        "tags": "it, programming, zeitgeist",
        "author": "author"
      }
    """
    And I press the Button "reqwest"

    # here we can use  the value that we created in the
    # step before. see the  'eval_expressions' function
    # evaluates everything inside `` . You have to take
    # care for correct json (quotes and commas ..)
    Then the reponse displayed in "reqwest" should be:
    """
      {
        "id": 10,
        "created_at": "`self.date`",
        "href": "http://my-fantastic-blog.org/newest_blog_post",
        "title": "newest blog Post",
        "body": "long opinionated speach about smth. related to Development",
        "tags": "it, programming, zeitgeist",
        "author": "author"
      }
    """

  Scenario: Mocking away the API for reqwest

    # reset the mocking
    Given I visit "../index.html"
    And I start mocking "http://localhost:8000" (strict)

    When I press the Button "superagent"
    Then a "post" to "/api/auth" should have happened with:
    """
      {
        "name": "admin",
        "password": "password"
      }
    """
    Given the API responds to a "post" on "/api/auth" with "401"

    # And the js-mini-app reacts
    Then the reponse displayed in "superagent" should be:
    """
      {
        "text": "An error occured"
      }
    """

    # again
    When I press the Button "superagent"
    And the API responds to a "post" on "/api/auth" with "200":
    """
      {
        "name": "admin",
        "password": "password"
      }
    """

    Then the reponse displayed in "superagent" should be:
    """
      {
        "name": "admin",
        "password": "password"
      }
    """

    When I press the Button "superagent"
    Given the API responds to a "post" on "/api/auth" with "200":
    """
       ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday" ]
    """

    Then the reponse displayed in "superagent" should be:
    """
       ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday" ]
    """
