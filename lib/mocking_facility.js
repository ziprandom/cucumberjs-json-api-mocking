module.exports = function() {
  require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

    /**
     * The mocked request data
     * @constructor
     */
    function MockRequest(xhr) {
      this._method    = xhr.method;
      this._url       = xhr.url;
      this._headers   = {};
      this.headers(xhr._requestHeaders);
      this.body(xhr.data);
    }

    /**
     * Get/set the HTTP method
     * @returns {string}
     */
    MockRequest.prototype.method = function() {
      return this._method;
    };

    /**
     * Get/set the HTTP URL
     * @returns {string}
     */
    MockRequest.prototype.url = function() {
      return this._url;
    };

    /**
     * Get/set a HTTP header
     * @param   {string} name
     * @param   {string} [value]
     * @returns {string|undefined|MockRequest}
     */
    MockRequest.prototype.header = function(name, value) {
      if (arguments.length === 2) {
        this._headers[name.toLowerCase()] = value;
        return this;
      } else {
        return this._headers[name.toLowerCase()] || null;
      }
    };

    /**
     * Get/set all of the HTTP headers
     * @param   {Object} [headers]
     * @returns {Object|MockRequest}
     */
    MockRequest.prototype.headers = function(headers) {
      if (arguments.length) {
        for (var name in headers) {
          if (headers.hasOwnProperty(name)) {
            this.header(name, headers[name]);
          }
        }
        return this;
      } else {
        return this._headers;
      }
    };

    /**
     * Get/set the HTTP body
     * @param   {string} [body]
     * @returns {string|MockRequest}
     */
    MockRequest.prototype.body = function(body) {
      if (arguments.length) {
        this._body = body;
        return this;
      } else {
        return this._body;
      }
    };

    module.exports = MockRequest;

  },{}],2:[function(require,module,exports){

    /**
     * The mocked response data
     * @constructor
     */
    function MockResponse() {
      this._status      = 200;
      this._headers     = {};
      this._body        = '';
      this._timeout     = false;
    }

    /**
     * Get/set the HTTP status
     * @param   {number} [code]
     * @returns {number|MockResponse}
     */
    MockResponse.prototype.status = function(code) {
      if (arguments.length) {
        this._status = code;
        return this;
      } else {
        return this._status;
      }
    };

    /**
     * Get/set a HTTP header
     * @param   {string} name
     * @param   {string} [value]
     * @returns {string|undefined|MockResponse}
     */
    MockResponse.prototype.header = function(name, value) {
      if (arguments.length === 2) {
        this._headers[name.toLowerCase()] = value;
        return this;
      } else {
        return this._headers[name.toLowerCase()] || null;
      }
    };

    /**
     * Get/set all of the HTTP headers
     * @param   {Object} [headers]
     * @returns {Object|MockResponse}
     */
    MockResponse.prototype.headers = function(headers) {
      if (arguments.length) {
        for (var name in headers) {
          if (headers.hasOwnProperty(name)) {
            this.header(name, headers[name]);
          }
        }
        return this;
      } else {
        return this._headers;
      }
    };

    /**
     * Get/set the HTTP body
     * @param   {string} [body]
     * @returns {string|MockResponse}
     */
    MockResponse.prototype.body = function(body) {
      if (arguments.length) {
        this._body = body;
        return this;
      } else {
        return this._body;
      }
    };

    /**
     * Get/set the HTTP timeout
     * @param   {boolean|number} [timeout]
     * @returns {boolean|number|MockResponse}
     */
    MockResponse.prototype.timeout = function(timeout) {
      if (arguments.length) {
        this._timeout = timeout;
        return this;
      } else {
        return this._timeout;
      }
    };

    module.exports = MockResponse;

  },{}],3:[function(require,module,exports){
    var MockRequest   = require('./MockRequest');
    var MockResponse  = require('./MockResponse');

    var notImplementedError = new Error('This feature hasn\'t been implmented yet. Please submit an Issue or Pull Request on Github.');

    //https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    //https://xhr.spec.whatwg.org/
    //http://www.w3.org/TR/2006/WD-XMLHttpRequest-20060405/

    MockXMLHttpRequest.STATE_UNSENT             = 0;
    MockXMLHttpRequest.STATE_OPENED             = 1;
    MockXMLHttpRequest.STATE_HEADERS_RECEIVED   = 2;
    MockXMLHttpRequest.STATE_LOADING            = 3;
    MockXMLHttpRequest.STATE_DONE               = 4;

    /**
     * The request handlers
     * @private
     * @type {Array}
     */
    MockXMLHttpRequest.handlers = [];

    /**
     * Add a request handler
     * @param   {function(MockRequest, MockResponse)} fn
     * @returns {MockXMLHttpRequest}
     */
    MockXMLHttpRequest.addHandler = function(fn) {
      MockXMLHttpRequest.handlers.unshift(fn);
      return this;
    };

    /**
     * Remove a request handler
     * @param   {function(MockRequest, MockResponse)} fn
     * @returns {MockXMLHttpRequest}
     */
    MockXMLHttpRequest.removeHandler = function(fn) {
      throw notImplementedError;
    };

    /**
     * Handle a request
     * @param   {MockRequest} request
     * @returns {MockResponse|null}
     */
    MockXMLHttpRequest.handle = function(request) {

      for (var i=0; i<MockXMLHttpRequest.handlers.length; ++i) {

        //get the generator to create a response to the request
        var response = MockXMLHttpRequest.handlers[i](request, new MockResponse());

        if (response) {
          if (MockXMLHttpRequest._strict_mode) {
            MockXMLHttpRequest.handlers.splice(i, 1);
          }
          return response;
        }

      }

      return null;
    };

    /**
     * Mock XMLHttpRequest
     * @constructor
     */
    function MockXMLHttpRequest() {
      this.reset();
      this.timeout = 0;
    }

    /**
     * Reset the response values
     * @private
     */
    MockXMLHttpRequest.prototype.reset = function() {

      this._requestHeaders  = {};
      this._responseHeaders = {};

      this.status       = 0;
      this.statusText   = '';

      this.response     = null;
      this.responseType = null;
      this.responseText = null;
      this.responseXML  = null;

      this.readyState   = MockXMLHttpRequest.STATE_UNSENT;
    };

    /**
     * Trigger an event
     * @param   {String} event
     * @returns {MockXMLHttpRequest}
     */
    MockXMLHttpRequest.prototype.trigger = function(event) {

      if (this.onreadystatechange) {
        this.onreadystatechange();
      }

      if (this['on'+event]) {
        this['on'+event]();
      }

      //iterate over the listeners

      return this;
    };

    MockXMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      this.reset();
      this.method   = method;
      this.url      = url;
      this.async    = async;
      this.user     = user;
      this.password = password;
      this.data     = null;
      this.readyState = MockXMLHttpRequest.STATE_OPENED;
    };

    MockXMLHttpRequest.prototype.setRequestHeader = function(name, value) {
      this._requestHeaders[name] = value;
    };

    MockXMLHttpRequest.prototype.overrideMimeType = function(mime) {
      throw notImplementedError;
    };

    // Generic function to execute a callback a given number
    // of times with a given delay between each execution
    MockXMLHttpRequest.prototype.timeoutLoop = function(fn, reps, delay) {
      var self = this;
      if (reps > 0 && self.readyState != MockXMLHttpRequest.STATE_DONE)
        self._sendTimeout = setTimeout(function() {
          fn();
          self.timeoutLoop(fn, reps-1, delay);
        }, delay);
      else {
        console.info("couldn't answer request:", this.url, this);
        //trigger an error because the request was not handled
        self.readyState = MockXMLHttpRequest.STATE_DONE;
        self.trigger('error');
      }
    }


    MockXMLHttpRequest.prototype.send = function(data) {
      var self = this;
      this.data = data;
      MockXMLHttpRequest._made_requests.push(this);
      self.readyState = MockXMLHttpRequest.STATE_LOADING;
      console.info("incomming request: ", this.url, this);
      // all in all we will test 10 times (after 500 secs)
      self.timeoutLoop(() => {

        var response = MockXMLHttpRequest.handle(new MockRequest(self));

        if (response && response instanceof MockResponse) {
          console.info("answering request: ", this.url, response);

          var timeout = response.timeout();

          if (timeout) {

            //trigger a timeout event because the request timed out - wait for the timeout time because many libs like jquery and superagent use setTimeout to detect the error type
            self._sendTimeout = setTimeout(function() {
              self.readyState = MockXMLHttpRequest.STATE_DONE;
              self.trigger('timeout');
            }, typeof(timeout) === 'number' ? timeout : self.timeout+1);

          } else {

            //map the response to the XHR object
            self.status             = response.status();
            self._responseHeaders   = response.headers();
            self.responseType       = 'text';
            self.response           = response.body();
            self.responseText       = response.body(); //TODO: detect an object and return JSON, detect XML and return XML
            self.readyState         = MockXMLHttpRequest.STATE_DONE;
            //trigger a load event because the request was received
            self.trigger('load');

          }

        } else {

          return ;
        }
      }, 20, 250); // 20 tries with pauses of 250 ms in between means: 5s

    };

    MockXMLHttpRequest.prototype.abort = function() {
      clearTimeout(this._sendTimeout);

      if (this.readyState > MockXMLHttpRequest.STATE_UNSENT && this.readyState < MockXMLHttpRequest.STATE_DONE) {
        this.readyState = MockXMLHttpRequest.STATE_UNSENT;
        this.trigger('abort');
      }

    };

    MockXMLHttpRequest.prototype.getAllResponseHeaders = function() {

      if (this.readyState < MockXMLHttpRequest.STATE_HEADERS_RECEIVED) {
        return null;
      }

      var headers = '';
      for (var name in this._responseHeaders) {
        if (this._responseHeaders.hasOwnProperty(name)) {
          headers += name+': '+this._responseHeaders[name]+'\r\n';
        }
      }

      return headers;
    };

    MockXMLHttpRequest.prototype.getResponseHeader = function(name) {

      if (this.readyState < MockXMLHttpRequest.STATE_HEADERS_RECEIVED) {
        return null;
      }

      return this._responseHeaders[name.toLowerCase()] || null;
    };

    MockXMLHttpRequest.prototype.addEventListener = function(event, listener) {
      throw notImplementedError;
    };

    MockXMLHttpRequest.prototype.removeEventListener = function(event, listener) {
      throw notImplementedError;
    };

    module.exports = MockXMLHttpRequest;

  },{"./MockRequest":1,"./MockResponse":2}],4:[function(require,module,exports){
    (function (global){
      if (typeof window !== "undefined") {
        module.exports = window;
      } else if (typeof global !== "undefined") {
        module.exports = global;
      } else if (typeof self !== "undefined"){
        module.exports = self;
      } else {
        module.exports = {};
      }

    }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
  },{}],"xhr-mock":[function(require,module,exports){
    var window              = require('global');
    var MockXMLHttpRequest  = require('./lib/MockXMLHttpRequest');
    var real                = window.XMLHttpRequest;
    var mock                = MockXMLHttpRequest;

    /**
     * Mock utility
     */
    module.exports = {

      XMLHttpRequest: MockXMLHttpRequest,

      /**
       * Replace the native XHR with the mocked XHR
       * @returns {exports}
       */
      setup: function(options) {
	window.XMLHttpRequest = mock;
	MockXMLHttpRequest.handlers = [];
        MockXMLHttpRequest._strict_mode = options.strict ? true : false;
        MockXMLHttpRequest._made_requests = []
	return this;
      },

      /**
       * Replace the mocked XHR with the native XHR and remove any handlers
       * @returns {exports}
       */
      teardown: function() {
        MockXMLHttpRequest._made_requests = []
        MockXMLHttpRequest._strict_mode = false;
        MockXMLHttpRequest.handlers = [];
	window.XMLHttpRequest = real;
	return this;
      },

      /**
       * return the log of all made requests
       * since setup
       * @returns {exports}
       */
      log: function() {
        return MockXMLHttpRequest._made_requests;
      },

      /**
       * Mock a request
       * @param   {string}    [method]
       * @param   {string}    [url]
       * @param   {Function}  fn
       * @returns {exports}
       */
      mock: function(method, url, fn) {
	var handler;
	if (arguments.length === 3) {
	  handler = function(req, res) {
	    if (req.method() === method && req.url() === url) {
	      return fn(req, res);
	    }
	    return false;
	  };
	} else {
	  handler = method;
	}

	MockXMLHttpRequest.addHandler(handler);

	return this;
      },

      /**
       * Mock a GET request
       * @param   {String}    url
       * @param   {Function}  fn
       * @returns {exports}
       */
      get: function(url, fn) {
	return this.mock('GET', url, fn);
      },

      /**
       * Mock a POST request
       * @param   {String}    url
       * @param   {Function}  fn
       * @returns {exports}
       */
      post: function(url, fn) {
	return this.mock('POST', url, fn);
      },

      /**
       * Mock a PUT request
       * @param   {String}    url
       * @param   {Function}  fn
       * @returns {exports}
       */
      put: function(url, fn) {
	return this.mock('PUT', url, fn);
      },

      /**
       * Mock a PATCH request
       * @param   {String}    url
       * @param   {Function}  fn
       * @returns {exports}
       */
      patch: function(url, fn) {
	return this.mock('PATCH', url, fn);
      },

      /**
       * Mock a DELETE request
       * @param   {String}    url
       * @param   {Function}  fn
       * @returns {exports}
       */
      delete: function(url, fn) {
	return this.mock('DELETE', url, fn);
      }

    };

  },{"./lib/MockXMLHttpRequest":3,"global":4}]},{},[]);

}
