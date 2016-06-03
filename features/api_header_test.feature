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
        xmlhttp.open("DELETE", "http://localhost:8000/api/auth");
        xmlhttp.setRequestHeader("X-Auth-Token", "my secret random xauth");
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
              document.getElementById('xhttp-header').textContent =
                JSON.stringify({"x-auth-token": xmlhttp.getResponseHeader("X-Auth-Token")}, null, 2);
            }
        };
        xmlhttp.send();
      }
    </script>
    </body>
    """
    And I start mocking "http://localhost:8000"

  Scenario: a DELETE with a Header

    When I press the Button "button"
    Then a "delete" to "/api/auth" should have happened with:
    """
      # X-Auth-Token: my secret random xauth
    """

    Given the API responds to the "delete" on "/api/auth" with "200":
    """
      # X-Auth-Token: this is a secret token
    """

    And the reponse displayed in "xhttp-header" should be:
    """
      {
        "x-auth-token": "this is a secret token"
      }
    """
