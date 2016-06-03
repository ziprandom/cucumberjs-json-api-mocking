var api_steps = require('../../index.js');

module.exports = function() {

  api_steps.call(this);

  let self = this

  this.Given(/^I visit "([^"]*)"$/, function (path) {
    if (path.match(/^http|^data/)) {
      self.startMocking(false);
      browser.url(path);
    } else {
      let pathRelativeToProjectRoot = "file://" + __dirname + "/../" + path;
      browser.url(pathRelativeToProjectRoot);
    }
  });

  this.Given(/^I open:$/, function(body) {
    browser.url(
      'data:text/html,' + encodeURIComponent(body)
    );
  });

  this.When(/^I press the Button "([^"]*)"$/, function (name) {
    client.click("#" + name + "_button");
  });

  this.Given(/^the reponse displayed in "([^"]*)" should be:$/, function (id, string) {
    client.pause(800);
    let displayedText = client.execute((id) => document.getElementById(id).textContent, id ).value
    expect(
      JSON.stringify(JSON.parse(
        displayedText
      ))
    ).toEqual(
      JSON.stringify(JSON.parse(
        self.eval_expressions(string)
      ))
    )
  });

};
