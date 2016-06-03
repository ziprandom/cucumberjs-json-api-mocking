# cucumberjs-json-api-mocking
A collection of Cucumber step definitions to comfortably define API mocks and expectations inline with Gherkin.

Based on [chimp](https://chimp.readme.io/) and therefore [Webdriver](http://webdriver.io/). Loads a modified version of [xhr-mock](https://github.com/jameslnewell/xhr-mock) into the browser to intercept XMLHttpRequests. The Steps let you define API call expectations and mocked responses for the wepapp.

## Usage

```gherkin

    # The XMLHttpRequest and Response Mocks are
    # injected into the browser context. Every
    # call now gets intercepted,logged and answered
    # if a proper response is defined.
    And I start mocking "http://localhost:8000"

    # An API request is triggered via the ui
    When I input "My fancy new Todo" into the Todo Input
    And I press Return

    # Expected API behavior can be defined after the request
    Then a "post" to "/api/todos" should have happened with:
    """
      {
        "title": "My fancy new Todo",
        "completed": false
      }
    """

    # API mocks can also be defined after the request was made
    # a loop waits 5 secs before a timeout is triggered.
    Given the API responds to the "post" on "/api/todos" with "201":
    """
      {
        "id": 5701886678138880,
        "title": "My fancy new Todo",
        "completed": false
      }
    """

    # When we made sure, the app makes the right api calls
    # and provide it with backend feedback we can go on
    # testing the ui.
    Then an active Todo "My fancy new Todo" should be visible
```

See `features/` for more usage examples.

## Installation

```sh
$ npm install --save-dev cucumberjs-json-api-mocking
```

To use the steps defined in `lib/api_mock/steps.js` run the functions in the context of one of your own step definition files like this:

```js
var json_api = require('cucumberjs-json-api-mocking');

module.exports = function() {

  json_api.call(this);

  // your own step definitions here ..

}
```

## Tests

To run the test suite:

```sh
# make sure chromium (firefox / phantomjs are untested)
# is installed
$ npm install -g chimp
$ npm install
$ chimp
```

## Credits
* [jameslnewell/xhr-mock](https://github.com/jameslnewell/xhr-mock) - `lib/mocking_facility.js` is a modified version of this XHRRequest Mocking Lib
