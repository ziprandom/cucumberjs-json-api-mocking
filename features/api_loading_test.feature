Feature: API Mocking II

  Background:
    Given I open:
    """
    <body>
    <pre id="xhttp-header">
    </pre>
    <input onClick="sendRequest()" id="button_button" type="button" value="button"/>
    <script>
      function sendRequest() {
        xmlhttp=new XMLHttpRequest();
        xmlhttp.open("POST", "http://localhost:8000/api/auth");
        xmlhttp.setRequestHeader("X-Auth-Token", "my secret random xauth");
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
              document.getElementById('xhttp-header').textContent =
                JSON.stringify({"x-auth-token": xmlhttp.getResponseHeader("X-Auth-Token")}, null, 2);
            }
        };
        xmlhttp.send('{"name": "admin", "password": "password"}');
      }
    </script>
    </body>
    """
    And I start mocking "http://localhost:8000"

  Scenario: loading Mocks from a json file
    And I start mocking "http://localhost:8000"
    And I load prerecorded mocks from "features/support/default_api_mocks.json"
    When I press the Button "button"

    Then a "post" to "/api/auth" should have happened with:
    """
      {
        "name": "admin",
        "password": "password"
      }
    """

    And the reponse displayed in "xhttp-header" should be:
    """
      {
        "x-auth-token": "this is a secret token"
      }
    """
