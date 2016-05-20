(function(root) {

  if (!root._utils) throw new Error("utils.js must be loaded");

  var currentRoute = 'index';

  var lastRoute = 'index';

  function buildLoginForm(parent) {
    var form = _utils.create('form', {id: "login-form", action: "login", class: "form-signin"});
    form.appendChild(_utils.create('h2', {class: "form-signin-heading"}, 'Please sign in'));
    form.appendChild(_utils.create('label', { for: 'userName', class: 'sr-only' }, 'User name'));
    var userNameInput = form.appendChild(_utils.create('input', { id: 'userName', name: 'userName', class: 'form-control', placeholder: 'User name' }));
    form.appendChild(_utils.create('label', { for: 'password', class: 'sr-only' }, 'User name'));
    var passwordInput = form.appendChild(_utils.create('input', { id: 'password', name: 'password', type:'password', class: 'form-control', placeholder: 'Password'}));
    var checkbox = form.appendChild(_utils.create('div', { class: 'checkbox' }));
    checkbox.appendChild(_utils.create('label'))
      .appendChild(_utils.create('input', { type: 'checkbox', value: 'Remember me'}, 'Remember me'));
    form.appendChild(_utils.create('button', { class: "btn btn-lg btn-primary btn-block", type: 'submit' }, 'Sign in'));

    form.onsubmit = function() {
      console.log("Submit")
      _utils.ajaxPost(form, function(res) {
        if (res && res.ok) {
          _utils.store.set('user', res.user);
          goto(parent, 'index');
        } else {
          _utils.store.remove('user');
          _utils.setClass(form, 'has-error');
        }
      });
      return false;
    }
    parent.appendChild(form);
  }

  function notFound(parent) {
    var panel = _utils.create('div', {class: 'panel panel-danger'});
    var panelHeading = panel.appendChild(_utils.create('div', {class: 'panel-heading'}));
    panelHeading.appendChild(_utils.create('h3', {class: 'panel-title'}, 'Page not found'));
    var panelBody = panel.appendChild(_utils.create('div', {class: 'panel-body'}));
    panelBody.appendChild(document.createTextNode('Sorry, the page you look for does not exist.'));
    parent.appendChild(panel);
  }

  var buildIndex = function(parent) {
    var panel = _utils.create('div', {class: 'panel panel-primary'});
    var panelHeading = panel.appendChild(_utils.create('div', {class: 'panel-heading'}));
    panelHeading.appendChild(_utils.create('h3', {class: 'panel-title'}, 'Blease - Requirements'));
    var panelBody = panel.appendChild(_utils.create('div', {class: 'panel-body'}));
    var btn = panelBody.appendChild(_utils.create('button', {class: 'btn'}, 'Create Requirement'));
    btn.onclick = function() {
      goto(parent, 'create');
      return false;
    }
    parent.appendChild(panel);
  }

  function createFormGroup(options) {
    var group = _utils.create('div', { class: 'form-group' });
    group.appendChild(_utils.create('label', { for: options.name }, options.label));
    group.appendChild(_utils.create(
      'input' || options.inputElement,
      { name: options.name, class: 'form-control', id: options.name, placeholder: options.placeholder, type: options.type || 'text'})
    );
    return group;
  }

  function buildCreateForm(parent) {
    var panel = _utils.create('div', {class: 'panel panel-primary'});
    var panelHeading = panel.appendChild(_utils.create('div', {class: 'panel-heading'}));
    panelHeading.appendChild(_utils.create('h3', {class: 'panel-title'}, 'Blease - Create new requirement'));
    var panelBody = panel.appendChild(_utils.create('div', {class: 'panel-body'}));
    var form = _utils.create('form', {action: 'requirement.create', class: 'form'})
    form.appendChild(_utils.create('h3', {}, 'Info'));
    form.appendChild(createFormGroup({name: 'title', label: 'Requirement Title', placeholder: 'Title'}));
    form.appendChild(createFormGroup({name: 'details', label: 'Details', placeholder: 'Details...'}));
    form.appendChild(_utils.create('h3', {}, 'Things'));
    var thingList = form.appendChild(_utils.create('ul', {class: 'list-unstyled'}));

    panelBody.appendChild(form);
    form.appendChild(_utils.create('h5', {}, 'Add new thing'))
    var newThingGroup = form.appendChild(_utils.create('div', {class: 'input-group'}));
    var newThingInput = newThingGroup.appendChild(_utils.create('input', { name: 'new-thing', class: 'form-control', placeholder: 'should...'}));
    var newThingAddOn = newThingGroup.appendChild(_utils.create('div', {class: 'input-group-addon'}));
    var addNewThingButton = newThingAddOn.appendChild(_utils.create('a', {href: '#', class: 'glyphicon glyphicon-plus-sign text-success'}));
    addNewThingButton.onclick = function() {
      var val = newThingInput.value;
      if (val) {
        var li = thingList.appendChild(_utils.create('li'));
        var gr = li.appendChild(_utils.create('div', {class: 'input-group'}));
        var addOn = gr.appendChild(_utils.create('div', {class: 'input-group-addon'}));
        addOn.appendChild(_utils.create('i', {class: 'glyphicon glyphicon-paperclip'}))
        gr.appendChild(_utils.create('input', {type: 'text', value: val, class: 'form-control'}));
        var delAddOn = gr.appendChild(_utils.create('div', {class: 'input-group-addon'}));
        var delButton = delAddOn.appendChild(_utils.create('a', {class: 'text-danger glyphicon glyphicon-remove-circle', href: '#'}));
        delButton.onclick = function() {
          li.remove();
          return false;
        }
        newThingInput.value = '';
      }
      return false;
    }
    var panelFooter = panel.appendChild(_utils.create('div', {class: 'panel-footer'}));
    var backBtn = panelFooter.appendChild(_utils.create('button', {class: 'btn'}, 'Back'));
    backBtn.onclick = function() {
      goto(parent, lastRoute);
      return false;
    }
    var saveBtn = panelFooter.appendChild(_utils.create('button', {class: 'btn btn-success'}, 'Save'));
    parent.appendChild(panel);
  }

  var routes = {
    login: buildLoginForm,
    index: buildIndex,
    create: buildCreateForm,
    notFound: notFound
  }

  function goto(parent, route) {
    _utils.store.set('lastRoute', route);
    lastRoute = new String(currentRoute);
    _utils.clearNode(parent);
    if (routes[route]) return routes[route](parent);
    return routes.notFound(parent);
  }

  root.blease = {
    start: function(parent) {
      if (!document.cookie) {
        _utils.store.remove('user');
      }
      var currentUser = _utils.store.get('user');
      if (!currentUser) {
        return goto(parent, 'login');
      }
      var lastUserRoute = _utils.store.get('lastRoute');
      return goto(parent, lastUserRoute || 'index');
    }
  };

})(this);
