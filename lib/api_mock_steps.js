"use strict";
var mocking_facility = require('./mocking_facility');

module.exports = function() {

  var self = this;

  this.defaultApiUri = "http://localhost:8000";
  this.apiUri = this.defaultApiUri;

  this.BeforeScenario(function(scenario) {
    client.execute(clearRequestLog);
  });

  this.Given(/^I start mocking(?: "([^"]*)")?( \(strict\))?$/, function(apiUri, strict) {
    if (apiUri | apiUri == "") {
      self.apiUri = apiUri;
    } else {
      self.apiUri = self.defaultApiUri;
    }
    self.startMocking(strict);
  });

  this.Given(/^I load prerecorded mocks from "([^"]*)"$/, function(path) {
    var absolutePath = process.cwd() + "/" + path;
    // use map & Object.assign to make a copy
    var mocks = require(absolutePath).map(
      function(mock) {
        return Object.assign({}, mock);
      }
    );
    return client.execute(
      prepareMocks, mocks.map(function(mock) {
        mock.body = JSON.stringify(mock.body);
        mock.endpoint = self.apiUri + mock.endpoint;
        return mock;
      })
    );
  });

  this.startMocking = function(strict) {
    strict = strict ? true : false;
    client.timeouts("script", 2000).execute(
      clearRequestLog
    ).execute(mocking_facility).execute(
      function(strict) {
        require('xhr-mock').setup({
          strict
        });
      }, strict);
  },

  this.Given(/^the API responds to (?:the |a )?"([^"]*)" on "([^"]*)" with "([^"]*)":$/, function(method, endpoint, code, body) {
    var splitBody = splitHeadersJson(body);
    addMockedResponse(method, endpoint, code, splitBody.body, splitBody.headers);
  });

  this.Given(/^the API responds to (?:the |a )?"([^"]*)" on "([^"]*)" with "([^"]*)"$/, function (method, endpoint, code) {
    addMockedResponse(method, endpoint, code)
  });

  this.Then(/^a "([^"]*)" to "([^"]*)" should have happened with:$/, function(method, endpoint, body, callback) {
    var splitBody = splitHeadersJson(body);
    waitForRequestToBeMade({method, endpoint, body: splitBody.body, headers: splitBody.headers}, callback);
  });

  this.Then(/^a "([^"]*)" to "([^"]*)" should have happened$/, function (method, endpoint, callback) {
    waitForRequestToBeMade({method, endpoint, body: null, headers: {}}, callback);
  });

  var addMockedResponse = function (method, endpoint, code, body, headers) {
    body = body ? self.eval_expressions(body) : "";
    headers = headers ? headers : {};
    var mock = {
      method, headers, body, code: parseInt(code,10), endpoint: self.apiUri + endpoint
    };
    return client.execute(
      prepareMocks, [mock]
    );
  };

  var splitHeadersJson = function(body) {
    var headers = {}
    var headersExtract = /(^\s*#\s*(.*)\s*:\s*(.*)\s*)($|\n)/mg
    var body = body.replace(headersExtract, function(match) {
      var headerline = match.match(/^\s*#\s*(.*)\s*:\s*(.+)?\s*($|\n)/);
      headers[headerline[1]] = headerline[2];
      return "";
    });
    body = body == "" ? null : body;
    return {headers: headers, body: body};
  };

  var prepareMocks = function(mocks) {
    var mock = require('xhr-mock');
    var mockIt = function(mock_params) {
      mock[mock_params.method.toLowerCase()](mock_params.endpoint, function(req, res) {
        var response = res
          .header("Content-Type", "application/json")
          .status(mock_params.code)
          .body(mock_params.body);

        for (var header in mock_params.headers) {
          if (mock_params.headers.hasOwnProperty(header)) {
            response.header(header, mock_params.headers[header]);
          }
        }
        return response;
      });
    };
    mocks.forEach( function(mock) {
      mockIt(mock);
    });
  };

  var clearRequestLog = function() {
    window.MockXMLHttpRequest && (window.MockXMLHttpRequest._made_requests = []);
  };

  var waitForRequestToBeMade = function(mock, callback) {
    var results;
    for (var i = 0; i < 10; i++) {
      var results = checkRequestWasMade(mock)
      if (results.found) {
        break;
      }
      client.pause(200);
    }
    if (results.found) {
      callback()
    } else {
      callback(requestsError(results.requests, mock))
    }
  };

  var checkRequestWasMade = function(mock) {
    var requests = browser.execute(
      function() {
        return require('xhr-mock').log();
      }
    ).value;
    var found = requests.reduce(
      function(found, req) {
        return found || requestEqual(req, mock);
      }, false
    )
    return {found: found, requests: requests}
  };

  var requestEqual = function (req, mock) {
    if (req.url.replace(/^https?:\/\/[\w\d\.]+(:\d+)?\/(.*)$/, '/$2') != mock.endpoint) {
      return false
    }
    if (req.method.toLowerCase() != mock.method.toLowerCase()) {
      return false;
    }
    if (JSON.stringify(JSON.parse(mock.body)) != JSON.stringify(JSON.parse(req.data))) {
      return false;
    }
    for (var header in mock.headers) {
      if (mock.headers.hasOwnProperty(header)) {
        if (req._requestHeaders[header] !== mock.headers[header]) return false;
      }
    }
    return true
  };

  var requestsError = function(encouteredRequests, mock) {
    var reserializeHeaders = function(req) {
      var reserializedHeaders = "";
      for (var header in mock.headers) {
        if (mock.headers.hasOwnProperty(header)) {
          reserializedHeaders += "\n# " + header + ": " + req._requestHeaders[header]
        }
      }
      return reserializedHeaders;
    };
    return new Error(
      "Request wasn't made." +
            (encouteredRequests.length > 0 ?
             " These occured instead:\n\n" +
             encouteredRequests.map(
               function(req) {
                 return req.method +" to "
                      + req.url + ": \n " +
                        reserializeHeaders(req) + "\n"
                      + JSON.stringify(
                          JSON.parse(req.data), null, 2)
               }).join("\n\n") : "" )
    );
  };

  this.eval_expressions = function(txt) {
    return txt.replace(
      //([\w_][\w\d_]+:)?
      /`(.*?)`/mg,
      function(match, exp) {
        return "" + eval(exp)
      });
  }

  var today = function(add) {
    add = add ? add : 0;
    var today = new Date(
      new Date().getTime() + (add * 24 * 60 * 60 * 1000)
    );
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10){
      dd='0'+dd
    }
    if(mm<10){
      mm='0'+mm
    }
    return yyyy + "-" + mm + "-" + dd;
  }

};
