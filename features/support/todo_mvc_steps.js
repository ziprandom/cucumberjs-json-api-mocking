let xp = require('xpath-builder').dsl();

module.exports = function() {

  let TodoItem = (text, active) => {

    let selector = xp.descendant('li').where(
      xp.descendant().where(
        xp.text().equals(text)
      )
    );

    if (active !== undefined) {
      selector = selector.where(
        active ? xp.attr('class').contains('completed') :
        xp.attr('class').contains('completed').inverse()
      );
    }

    let status_checkbox = selector.descendant("input").where(
      xp.attr('type').equals('checkbox')
    );

    let status = () => client.getValue(selector);

    return {
      selector: selector.toString(),
      status_checkbox: status_checkbox.toString(),
      status
    };
  }

  this.Given(/^I wait for "([^"]*)" ms$/, function (secs) {
    client.pause(secs);
  });

  this.Then("no Todos should be visible", function() {
    client.waitForExist("li", 2000,  false);
  });

  this.When(/^I input "([^"]*)" into the Todo Input$/, function (text) {
    client.waitForExist(`input#new-todo`);
    client.setValue("input#new-todo", text);
  });

  this.When(/^I press Return$/, function () {
    client.keys("Enter");
  });

  this.Given(/^I click on the toggle Botton of "([^"]*)"$/, function (title) {
    let item = TodoItem(title);
    client.waitForExist(item.selector);
    client.click(item.status_checkbox);
  });

  this.When(/^I click on the "([^"]*)" Link$/, function (name) {
    let button = xp.descendant('a').where(xp.text().equals(name)).toString();
    client.waitForExist(button);
    client.click(button);
  });

  this.Then(/^a(?:n? (active|completed))? Todo "([^"]*)" should( not)? be visible$/, function (active, title, invert) {
    active = (active == "active") ?
             false : (active == "completed") ?
             true : null;

    let item = active !== undefined ?
               TodoItem(title, active) : TodoItem(title);

    client.waitForExist(item.selector,
                        2000, invert ? true : false);
  });
}
