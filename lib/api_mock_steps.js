let mocking_facility = require('./mocking_facility');

module.exports = function() {

  let self = this;

  this.defaultApiUri = "http://localhost:8000";
  this.apiUri = this.defaultApiUri;

  this.BeforeScenario((scenario) => {
    client.execute(clearRequestLog);
  });

  this.Given(/^I start mocking(?: "([^"]*)")?( \(strict\))?$/, (apiUri, strict) => {
    if (typeof apiUri == "string") {
      self.apiUri = apiUri;
    } else {
      self.apiUri = self.defaultApiUri;
    }
    self.startMocking(strict);
  });

  this.startMocking = (strict) => {
    strict = strict ? true : false;
    client.timeouts("script", 2000).execute(
      clearRequestLog
    ).execute(mocking_facility).execute(
      (strict) => require('xhr-mock').setup({
        strict
      }), strict
    );
  },

  this.Given(/^the API responds to (?:the |a )?"([^"]*)" on "([^"]*)" with "([^"]*)":$/, function(method, endpoint, code, body) {
    addMockedResponse(method, endpoint, code, body);
  });

  this.Given(/^the API responds to (?:the |a )?"([^"]*)" on "([^"]*)" with "([^"]*)"$/, function (method, endpoint, code) {
    addMockedResponse(method, endpoint, code)
  });

  this.Then(/^a "([^"]*)" to "([^"]*)" should have happened with:$/, function(method, endpoint, body, callback) {
    waitForRequestToBeMade(method, endpoint, body, callback);
  });

  this.Then(/^a "([^"]*)" to "([^"]*)" should have happened$/, function (method, endpoint, callback) {
    waitForRequestToBeMade(method, endpoint, null, callback);
  });

  let addMockedResponse = function (method, endpoint, code, body) {
    body = body ? self.eval_expressions(body) : "";
    let mock = {
      method, body, code: parseInt(code,10), endpoint: `${self.apiUri}${endpoint}`
    };
    return client.execute(
      prepareMocks, [mock]
    );
  };

  let prepareMocks = function(mocks) {
    let mock = require('xhr-mock');
    let mockIt = ({method, endpoint, code, body}) => {
      mock[method](endpoint, function(req, res) {
        let response = res
          .header("Content-Type", "application/json")
          .status(code)
          .body(body);
        return response;
      });
    };
    mocks.forEach(
      (mock) => mockIt(mock)
    );
  };

  let clearRequestLog = () => {
    window.MockXMLHttpRequest && (window.MockXMLHttpRequest._made_requests = []);
  };

  let waitForRequestToBeMade = (method, endpoint, body, callback) => {
    let found, requests;
    for (let i = 0; i < 10; i++) {
      ({found, requests} = checkRequestWasMade(method, endpoint, body))
      if (found) {
        break;
      }
      client.pause(200);
    }
    if (found) {
      callback()
    } else {
      callback(requestsError(requests))
    }
  };

  let checkRequestWasMade = function(method, endpoint, body) {
    let requests = browser.execute(
      () => require('xhr-mock').log()
    ).value;
    let found = requests.reduce(
      (found, req) => found || requestEqual(req, {method, endpoint, body: body}), false
    )
    return {found, requests}
  };

  let requestEqual = (req, {method, endpoint, body}) => {
    if (req.url.replace(/^https?:\/\/[\w\d\.]+(:\d+)?\/(.*)$/, '/$2') != endpoint) {
      return false
    }
    if (req.method.toLowerCase() != method.toLowerCase()) {
      return false;
    }

    if (JSON.stringify(JSON.parse(body)) != JSON.stringify(JSON.parse(req.data))) {
      return false;
    }
    return true
  };

  let requestsError = (encouteredRequests) => {
    return new Error(
      "Request wasn't made." +
            (encouteredRequests.length > 0 ?
             " These occured instead:\n\n" +
             encouteredRequests.map(
               (req) => (`${req.method} to ${req.url}: \n \n ${JSON.stringify(JSON.parse(req.data), null, 2)}`)
             ).join("\n\n") :
             ""
            )
    );
  };

  this.eval_expressions = (txt) => txt.replace(
    //([\w_][\w\d_]+:)?
    /`(.*?)`/mg,
    (match, exp) =>  `${eval(exp)}`
  );

  let today = (add) => {
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
    return `${yyyy}-${mm}-${dd}`;
  }

};
