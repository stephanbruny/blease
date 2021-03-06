(function(root) {

  if (!root._utils) throw new Error("utils.js must be loaded");

  var currentRoute = 'index';

  var lastRoute = 'index';

  var requirementStates = {
    'New': 'primary',
    'In Progress': 'info',
    'Critical': 'danger',
    'Need details': 'warning',
    'Completed': 'success'
  }

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
      _utils.ajaxPost(form, {}, function(res) {
        if (res && res.ok) {
          _utils.store.set('user', res.user);
          blease.start(parent);
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
    var panelFooter = panel.appendChild(_utils.create('div', {class: 'panel-footer'}));
    var backBtn = panelFooter.appendChild(_utils.create('button', {class: 'btn btn-default'}, 'Back'));
    backBtn.onclick = function() {
      goto(parent, lastRoute);
      return false;
    }
    parent.appendChild(panel);
  }

  function navigationButtonOnClick(parent, route) {
    return function() {
      goto(parent, route);
      return false;
    }
  }

  function loadCategories(cb) {
    _utils.sendRpc('category.list', {}, cb);
  }

  function loadProjects(cb) {
    _utils.sendRpc('project.list', {}, cb);
  }

  var buildIndex = function(parent) {
    var panel = _utils.create('div', {class: 'panel panel-primary'});
    var panelHeading = panel.appendChild(_utils.create('div', {class: 'panel-heading'}));
    panelHeading.appendChild(_utils.create('h3', {class: 'panel-title'}, 'Blease - Requirements'));
    var panelBody = panel.appendChild(_utils.create('div', {class: 'panel-body'}));
    var btnGroup = panelBody.appendChild(_utils.create('div', {class: 'btn-group'}));
    var btn = btnGroup.appendChild(_utils.create('button', {class: 'btn btn-success'}, 'Create Requirement'));
    btn.onclick = navigationButtonOnClick(parent, 'create');
    var btnCategory = btnGroup.appendChild(_utils.create('button', {class: 'btn btn-default'}, 'Create Category'));
    btnCategory.onclick = navigationButtonOnClick(parent, 'category');
    var btnProject= btnGroup.appendChild(_utils.create('button', {class: 'btn btn-info'}, 'Create Project'));
    btnProject.onclick = navigationButtonOnClick(parent, 'project');
    var tableHeader = {
      _id: { name: 'ID' },
      project: { name: 'Project', delegate: function(item, data) {
        var result = ' - ';
        if (item.project) {
          for (var i = 0; i < data.projects.length; i++) {
            if (data.projects[i]._id === item.project) {
              result = data.projects[i].title; break;
            }
          }
        }
        return _utils.create('strong', {class: 'center-block text-center text-primary'}, result);
      }},
      title: { name: 'Title' },
      category: { name: 'Category', delegate: function(item, data) {
        var result = ' - ';
        if (item.category) {
          for (var i = 0; i < data.categories.length; i++) {
            if (data.categories[i]._id === item.category) {
              result = data.categories[i].title; break;
            }
          }
        }
        return _utils.create('span', {class: 'center-block text-center'}, result);
      }},
      crated: { name: "Created", delegate: function(item) {
        return document.createTextNode(moment(item.created).fromNow());
      } },
      modified: { name: "Modified", delegate: function(item) {
        return item.modified ?
          document.createTextNode(moment(item.modified).fromNow())
          : _utils.create('span', {class: 'center-block text-center'}, ' - ');
      } },
      tests: { name: 'Tests', delegate: function(item) {
        var el = _utils.create('div', {class: 'center-block text-center'});
        createChild(el, 'span', {class: 'text-default'}, (item.tests ? item.tests.length : 0).toString())
        return el;
      } },
      priority: { name: 'Priority', delegate: function(item) {
        var prio = item.priority || 0;
        var severity =
          prio < 0 ? 'text-success' :
          prio < 5 ? 'text-primary' :
          prio < 10 ? 'text-warning' :
          'text-danger';
        var el = _utils.create('div', {class: 'center-block text-center'});
        createChild(el, 'span', {class: severity}, (item.priority ? item.priority : 0).toString())
        return el;
      } },
      complexity: { name: 'Complexity', delegate: function(item) {
        var val = 0;
        if (item.tests) {
          for (var i = 0; i < item.tests.length; i++) {
            val += parseInt(item.tests[i].complexity);
          }
        }
        var el = _utils.create('div', {class: 'center-block text-center'});
        var severity =
          val < 5 ? 'label-success' :
          val < 10 ? 'label-primary' :
          val < 15 ? 'label-warning' :
          'label-danger';

        el.appendChild(_utils.create('span', {class: 'label ' + severity}, val));
        return el;
      }},
      status: {name: 'Status', delegate: function(item) {
        var el = _utils.create('div', {class: 'btn-group'});
        var statusButton = el.appendChild(_utils.create('button', {class: 'btn btn-sm dropdown-toggle btn-' + requirementStates[item.status || 'New'], "data-toggle": "dropdown", "aria-haspopup":"true", "aria-expanded":"false"}));
        var statusText = statusButton.appendChild(_utils.create('span', null, item.status || 'New'));
        var statusDropDown = el.appendChild(_utils.create('ul', {class: 'dropdown-menu'}));
        statusButton.appendChild(_utils.create('span', { class: 'caret' }));
        function setStatusOnClick(key) {
          return function() {
            statusButton.setAttribute('class',"btn btn-sm dropdown-toggle btn-" + requirementStates[key]);
            statusText.innerHTML = key;
            item.status = key;
            _utils.sendRpc('requirement.update', {_id: item._id, status: key}, function(res) {
              console.log(res);
            })
          }
        }
        for (var key in requirementStates) {
          var li = statusDropDown.appendChild(_utils.create('li'));
          var stateBtn = li.appendChild(_utils.create('a', {href: '#', class: 'text-' + requirementStates[key]}, key));
          stateBtn.onclick = setStatusOnClick(key);
        }
        return el;
      }},
      controls: {name: 'Options', delegate: function(item) {
        var list = _utils.create('div', {class: 'btn-group center-block', role: 'group'});
        var editButton = list.appendChild(_utils.create('button', {class: 'btn btn-sm btn-default'}, 'Edit'));
        list.appendChild(_utils.create('button', {class: 'btn btn-sm btn-danger'}, 'Remove'));
        editButton.onclick = function() {
          goto(parent, 'create', item);
          return false;
        }
        return list;
      }}
    };
    var table = _utils.createTable({class: 'table table-bordered'}, tableHeader);
    loadProjects(function(projects) {
    loadCategories(function(categories) {
      _utils.sendRpc('requirement.list', {}, function(res) {
        _utils.addTableData(table, tableHeader, res, { categories: categories, projects: projects });
      });
    })});
    panel.appendChild(table);
    var footer = createChild(panel, 'div', {class: 'panel-footer clear-fix'});
    var pagination = createChild(footer, 'nav').appendChild(_utils.create('ul', { class: 'pagination pagination-sm' }));
    createChild(pagination, 'li')
      .appendChild(_utils.create('a', {href: '#', 'aria-label': "Previous"}))
      .appendChild(_utils.create('span', {'aria-hidden': true, class: 'glyphicon glyphicon-backward'}))
      createChild(pagination, 'li')
        .appendChild(_utils.create('a', {href: '#', 'aria-label': "Next"}))
        .appendChild(_utils.create('span', {'aria-hidden': true, class: 'glyphicon glyphicon-forward'}))
    parent.appendChild(panel);
  }

  function createFormGroup(options) {
    var group = _utils.create('div', { class: 'form-group' });
    group.appendChild(_utils.create('label', { for: options.name }, options.label));
    group.appendChild(_utils.create(
      'input' || options.inputElement,
      { name: options.name, class: 'form-control', id: options.name, placeholder: options.placeholder, type: options.type || 'text', required: "required", value: options.value || '', autocomplete: 'false'})
    );
    return group;
  }

  function addThingInput(data) {
    var li = _utils.create('div');
    var gr = li.appendChild(_utils.create('div', {class: 'input-group'}));
    var addOn = gr.appendChild(_utils.create('div', {class: 'input-group-addon'}));
    addOn.appendChild(_utils.create('i', {class: 'glyphicon glyphicon-check'}))
    var input = gr.appendChild(_utils.create('input', {type: 'text', value: data.title, class: 'form-control', name: 'tests', 'data-complexity': data.complexity || 1}));
    var scoreAddOn = gr.appendChild(_utils.create('span', {class: 'input-group-addon'}));
    var complexityBadge = scoreAddOn.appendChild(_utils.create('span', {class: 'badge'}, data.complexity || 1));
    var delAddOn = gr.appendChild(_utils.create('span', {class: 'input-group-btn'}));
    var plusButton = delAddOn.appendChild(_utils.create('button', {class: 'btn btn-default'}));
    plusButton.appendChild(_utils.create('i', {class: 'glyphicon glyphicon-chevron-up'}))
    var minusButton = delAddOn.appendChild(_utils.create('button', {class: 'btn btn-default'}));
    minusButton.appendChild(_utils.create('i', {class: 'glyphicon glyphicon-chevron-down'}))
    function updateComplexity() {
      input.setAttribute('data-complexity', data.complexity);
      complexityBadge.innerHTML = data.complexity;
      return false;
    }
    plusButton.onclick = function() { data.complexity++; return updateComplexity(); }
    minusButton.onclick = function() { data.complexity > 1 ? data.complexity-- : data.complexity = 1; return updateComplexity(); };
    var delButton = delAddOn.appendChild(_utils.create('button', {class: 'btn btn-danger', href: '#'}));
    delButton.appendChild(_utils.create('i', {class: 'glyphicon glyphicon-remove-circle'}))
    delButton.onclick = function() {
      li.remove();
      return false;
    }
    return li;
  }

  function onSaveButtonClick(parent, form, delegates, backRoute) {
    return function() {
      _utils.ajaxPost(form, delegates, function(res) {
        goto(parent, backRoute || 'index');
      });
      return false;
    }
  }

  function buildCreateForm(parent, options) {
    options = options || {};
    var panel = _utils.create('div', {class: 'panel panel-primary'});
    var panelHeading = panel.appendChild(_utils.create('div', {class: 'panel-heading'}));
    panelHeading.appendChild(_utils.create('h3', {class: 'panel-title'}, !options.title ? 'Blease - Create new requirement' : 'Edit - ' + options.title));
    var panelBody = panel.appendChild(_utils.create('div', {class: 'panel-body'}));
    var form = _utils.create('form', {action: options._id ? 'requirement.update' : 'requirement.create', class: 'form'})
    if (options._id) {
      form.appendChild(_utils.create('input', {type: 'hidden', name: '_id', id: '_id', value: options._id}));
    }
    form.appendChild(_utils.create('input', {type: 'hidden', name: 'status', id: 'status', value: options.status || 'New'}));
    var projectInput = form.appendChild(_utils.create('input', {type: 'hidden', name: 'project', id: 'project', value: options.project}));
    form.appendChild(_utils.create('h3', {}, 'Info'));

    form.appendChild(createFormGroup({name: 'title', label: 'Requirement Title', placeholder: 'Title', value: options.title ? options.title : null}));
    form.appendChild(createFormGroup({name: 'details', label: 'Details', placeholder: 'Details...', value: options.details ? options.details : null}));

    var prioGroup = createChild(form, 'div', {class: 'form-group'});
    createChild(prioGroup, 'label', {for: 'priority'}, 'Priority');
    var prioEl = createChild(prioGroup, 'div', {class: 'input-group'});
    var prioInput = createChild(prioEl, 'input', {class: 'form-control', type: 'number', name: 'priority', id: 'priority', value: 1});
    var prioBtns = createChild(prioEl, 'span', {class: 'input-group-btn'});
    var prioPlus = createChild(prioBtns, 'button', {class: 'btn btn-default'});
    createChild(prioPlus, 'span', { class: 'glyphicon glyphicon-plus-sign' });
    var prioMinus = createChild(prioBtns, 'button', {class: 'btn btn-default'});
    createChild(prioMinus, 'span', { class: 'glyphicon glyphicon-minus-sign' });
    prioPlus.onclick = function() { prioInput.value = parseInt(prioInput.value) + 1; return false; };
    prioMinus.onclick = function() { prioInput.value = parseInt(prioInput.value) - 1; return false; };

    form.appendChild(_utils.create('h3', {}, 'Things'));
    var thingList = form.appendChild(_utils.create('div', {class: 'form-group'}));

    panelBody.appendChild(form);
    form.appendChild(_utils.create('h5', {}, 'Add new thing'))
    var newThingGroup = form.appendChild(_utils.create('div', {class: 'input-group'}));
    var newThingInput = newThingGroup.appendChild(_utils.create('input', { name: 'new-thing', class: 'form-control', placeholder: 'should...'}));
    var newThingAddOn = newThingGroup.appendChild(_utils.create('span', {class: 'input-group-btn'}));
    var addNewThingButton = newThingAddOn.appendChild(_utils.create('a', {href: '#', class: 'btn btn-success'}));
    addNewThingButton.appendChild(_utils.create('i', {class: 'glyphicon glyphicon-plus-sign'}))
    addNewThingButton.onclick = function() {
      var val = newThingInput.value;
      if (val) {
        var li = thingList.appendChild(addThingInput({title: val}));
        newThingInput.value = '';
      }
      return false;
    }
    if (options.tests) {
      for (var i = 0; i < options.tests.length; i++) {
        thingList.appendChild(addThingInput(options.tests[i]));
      }
    }
    form.appendChild(_utils.create('h3', {}, 'Options'));
    var categoryInput = form.appendChild(_utils.create('input', {type: 'hidden', name: 'category', id: 'category', value: options.category || null}));
    function onSelectCategory(cat) {
      return function() {
        categoryInput.value = cat._id;
        categoryButtonText.innerHTML = cat.title;
        return false;
      }
    }
    function onSelectProject(proj) {
      return function() {
        projectInput.value = proj._id;
        projectButtonText.innerHTML = proj.title;
        return false;
      }
    }
    var buttonGroup = form.appendChild(_utils.create('div', {class: 'btn-group'}));
    var categoryButton = buttonGroup.appendChild(_utils.create('button', {
      class: 'btn btn-default dropdown-toggle',
      "data-toggle": "dropdown", "aria-haspopup":"true", "aria-expanded":"false"
    }));
    categoryButton.appendChild(_utils.create('span', {}, 'Category: '));
    var categoryButtonText = categoryButton.appendChild(_utils.create('span', {}, options.category || 'Choose category'));
    var categoryDropDown = buttonGroup.appendChild(_utils.create('ul', {class: 'dropdown-menu'}));
    var projectButtonGroup = form.appendChild(_utils.create('div', {class: 'btn-group'}));
    var projectButton = projectButtonGroup.appendChild(_utils.create('button', {
      class: 'btn btn-info dropdown-toggle',
      "data-toggle": "dropdown", "aria-haspopup":"true", "aria-expanded":"false"
    }));
    projectButton.appendChild(_utils.create('span', {}, 'Project: '));
    var projectButtonText = projectButton.appendChild(_utils.create('span', {}, options.project || 'Choose project'));
    var projectDropDown = projectButtonGroup.appendChild(_utils.create('ul', {class: 'dropdown-menu'}));
    projectButton.appendChild(_utils.create('span', { class: 'caret' }));
    loadCategories(function(res) {
      for (var i = 0; i < res.length; i++) {
        var li = categoryDropDown.appendChild(_utils.create('li', {}));
        var cat = li.appendChild(_utils.create('a', {}, res[i].title));
        if (options.category && res[i]._id === options.category) {
          categoryButtonText.innerHTML = res[i].title;
        }
        cat.onclick = onSelectCategory(res[i]);
      }
    });
    loadProjects(function(res) {
      for (var i = 0; i < res.length; i++) {
        var li = projectDropDown.appendChild(_utils.create('li', {}));
        var cat = li.appendChild(_utils.create('a', {}, res[i].title));
        if (options.project && res[i]._id === options.project) {
          projectButtonText.innerHTML = res[i].title;
        }
        cat.onclick = onSelectProject(res[i]);
      }
    });
    var panelFooter = panel.appendChild(_utils.create('div', {class: 'panel-footer'}));
    var backBtn = panelFooter.appendChild(_utils.create('button', {class: 'btn btn-default'}, 'Back'));
    backBtn.onclick = function() {
      goto(parent, lastRoute);
      return false;
    }
    var saveBtn = panelFooter.appendChild(_utils.create('button', {class: 'btn btn-success'}, 'Save'));
    saveBtn.onclick = function() {
      _utils.ajaxPost(form, {
        tests: function(el) {
          return {
            title: el.value,
            complexity: parseInt(el.getAttribute('data-complexity'))
          }
        }
      },
      function(res) {
        console.log(res);
        goto(parent, 'index');
      });
      return false;
    }
    parent.appendChild(panel);
  }

  function buildCategoryForm(parent, options) {
    options = options || {};
    var panel = _utils.create('div', {class: 'panel panel-primary'});
    var panelHeading = panel.appendChild(_utils.create('div', {class: 'panel-heading'}));
    panelHeading.appendChild(_utils.create('h3', {class: 'panel-title'}, !options.title ? 'Blease - Create new category' : 'Edit Category - ' + options.title));
    var panelBody = panel.appendChild(_utils.create('div', {class: 'panel-body'}));
    var form = _utils.create('form', {action: options._id ? 'category.update' : 'category.create', class: 'form'});
    form.appendChild(createFormGroup({name: 'title', label: 'Category Title', placeholder: 'Title', value: options.title ? options.title : null}));
    form.appendChild(createFormGroup({name: 'description', label: 'Description', placeholder: 'Description', value: options.description ? options.description : null}));
    var panelFooter = panel.appendChild(_utils.create('div', {class: 'panel-footer'}));
    var backBtn = panelFooter.appendChild(_utils.create('button', {class: 'btn btn-default'}, 'Back'));
    backBtn.onclick = function() {
      goto(parent, lastRoute);
      return false;
    }
    var saveBtn = panelFooter.appendChild(_utils.create('button', {class: 'btn btn-success'}, 'Save'));
    saveBtn.onclick = onSaveButtonClick(parent, form, {});
    panelBody.appendChild(form);
    parent.appendChild(panel);
  }

  function buildProjectForm(parent, options) {
    options = options || {};
    var panel = _utils.create('div', {class: 'panel panel-primary'});
    var panelHeading = panel.appendChild(_utils.create('div', {class: 'panel-heading'}));
    panelHeading.appendChild(_utils.create('h3', {class: 'panel-title'}, !options.title ? 'Blease - Create new Project' : 'Edit Project - ' + options.title));
    var panelBody = panel.appendChild(_utils.create('div', {class: 'panel-body'}));
    var form = _utils.create('form', {action: options._id ? 'project.update' : 'project.create', class: 'form'});
    form.appendChild(createFormGroup({name: 'title', label: 'Project Title', placeholder: 'Title', value: options.title ? options.title : null}));
    form.appendChild(createFormGroup({name: 'description', label: 'Description', placeholder: 'Description', value: options.description ? options.description : null}));
    form.appendChild(_utils.create('h4', {}, 'Estimated cost per effort point'));
    var costGroup = form.appendChild(_utils.create('div', {class: 'input-group'}));
    var costAddOn = costGroup.appendChild(_utils.create('div', {class: 'input-group-addon'}));
    costAddOn.appendChild(_utils.create('span', {class: 'glyphicon glyphicon-euro'}));
    var costInput = costGroup.appendChild(_utils.create('input', { class: 'form-control', id: 'pointCost', name: 'pointCost', type: 'number', step: 0.01 }));
    // costGroup.appendChild(_utils.create('label', { for: 'pointCost' }, 'Estimated cost per effort point'));
    var costAddOnBtn = costGroup.appendChild(_utils.create('span', {class: 'input-group-btn'}));
    var plusButton = costAddOnBtn.appendChild(_utils.create('button', {class: 'btn btn-default'}));
    plusButton.appendChild(_utils.create('span', {class: 'glyphicon glyphicon-plus-sign'}));
    var minusButton = costAddOnBtn.appendChild(_utils.create('button', {class: 'btn btn-default'}));
    minusButton.appendChild(_utils.create('span', {class: 'glyphicon glyphicon-minus-sign'}));
    plusButton.onclick = function() { costInput.value = (parseFloat(costInput.value || 0) + 1).toFixed(2); return false; };
    minusButton.onclick = function() { costInput.value = (parseFloat(costInput.value || 0) - 1).toFixed(2); return false; };

    var panelFooter = panel.appendChild(_utils.create('div', {class: 'panel-footer'}));
    var backBtn = panelFooter.appendChild(_utils.create('button', {class: 'btn btn-default'}, 'Back'));
    backBtn.onclick = function() {
      goto(parent, lastRoute);
      return false;
    }
    var saveBtn = panelFooter.appendChild(_utils.create('button', {class: 'btn btn-success'}, 'Save'));
    saveBtn.onclick = onSaveButtonClick(parent, form, {});
    panelBody.appendChild(form);
    parent.appendChild(panel);
  }

  function buildUsersList(parent) {
    var panel = createChild(parent, 'div', {class: 'panel panel-primary'});
    var panelHeading = panel.appendChild(_utils.create('div', {class: 'panel-heading'}));
    panelHeading.appendChild(_utils.create('h3', {class: 'panel-title'}, 'Blease - Users'));
    var panelBody = panel.appendChild(_utils.create('div', {class: 'panel-body'}));
    var btnGroup = createChild(panelBody, 'div', {class: 'btn-group'});
    var createBtn = createChild(btnGroup, 'button', {class: 'btn btn-success'}, 'Create new user');
    createBtn.onclick = navigationButtonOnClick(parent, 'userCreate');
    var tableHeader = {
      _id: { name: 'ID' },
      name: { name: 'Name' },
      created: { name: 'Created', delegate: function(item) {
        return document.createTextNode(moment(item.created).fromNow());
      } },
      firstName: { name: 'First name' },
      lastName: { name: 'Last name' },
      options: { name: 'Options', delegate: function(item) {
        var gr = _utils.create('div', {class: 'btn-group'});
        createChild(gr, 'button', {class: 'btn btn-sm btn-default'}, 'Edit');
        createChild(gr, 'button', {class: 'btn btn-sm btn-danger'}, 'Remove');
        return gr;
      } }
    }
    var table = _utils.createTable({class: 'table table-bordered'}, tableHeader);
    panel.appendChild(table);
    _utils.sendRpc('user.list', {}, function(res) {
      _utils.addTableData(table, tableHeader, Array.isArray(res) ? res : [res], {});
    });
  }

  function buildUserCreateForm(parent, options) {
    options = options || {};
    var panel = createChild(parent, 'div', {class: 'panel panel-primary'});
    var panelHeading = panel.appendChild(_utils.create('div', {class: 'panel-heading'}));
    panelHeading.appendChild(_utils.create('h3', {class: 'panel-title'}, 'Blease - Create new user'));
    var panelBody = panel.appendChild(_utils.create('div', {class: 'panel-body'}));
    var form = createChild(panelBody, 'form', {action: 'user.add', class: 'form', autocomplete: 'false'});
    createChild(form , 'h3', {}, 'New account');
    var nameInput = form.appendChild(createFormGroup({name: 'name', label: 'User name', placeholder: 'User name', value: options.name ? options.name : null}));
    var emailInput = form.appendChild(createFormGroup({name: 'email', label: 'E-mail', placeholder: 'name@foo.bar', type: 'email', value: options.email ? options.email : null}));
    var fistNameInput = form.appendChild(createFormGroup({name: 'firstName', label: 'First name', placeholder: 'First name', value: options.firstName ? options.firstName : null}));
    var lastNameInput = form.appendChild(createFormGroup({name: 'lastName', label: 'Last name', placeholder: 'Last name', value: options.lastName ? options.lastName : null}));
    var pw1 = form.appendChild(createFormGroup({name: 'password', label: 'Password', type: 'password', value: '', placeholder: ''}));
    var pw2 = form.appendChild(createFormGroup({name: 'password2', label: 'Retype Password', type: 'password', value: '', placeholder: ''}));
    form.appendChild(createFormGroup({name: 'isAdmin', label: 'Admin user', type: 'checkbox', value: '', placeholder: ''}));
    var footer = createChild(panel, 'div', {class: 'panel-footer'});
    createChild(footer, 'button', {class: 'btn btn-default'}, 'Back').onclick = function() { goto(parent, 'users'); return false; };
    createChild(footer, 'button', {class: 'btn btn-success'}, 'Save').onclick = function() {
      if (!nameInput.querySelector('input').value) _utils.setClass(nameInput, 'has-error');
      if (pw1.querySelector('input').value != pw2.querySelector('input').value) {
        _utils.setClass(pw1, 'has-error');
        _utils.setClass(pw2, 'has-error');
      }
      if (form.querySelector('.has-error')) return false;
      onSaveButtonClick(parent, form, {
        password2: function() { return undefined; }
      }, 'users')();
      return false;
    }
  }

  var routes = {
    login: buildLoginForm,
    index: buildIndex,
    create: buildCreateForm,
    category: buildCategoryForm,
    project: buildProjectForm,
    users: buildUsersList,
    userCreate: buildUserCreateForm,
    notFound: notFound
  }

  function goto(parent, route, options, temp) {
    if (!temp)  {
      _utils.store.set('lastRoute', { path: route, options: options });
      lastRoute = new String(currentRoute);
    }
    _utils.clearNode(parent);
    if (routes[route]) return routes[route](parent, options);
    return routes.notFound(parent);
  }

  function createChild(parent, tag, attributes, text) {
    return parent.appendChild(_utils.create(tag, attributes, text));
  }

  function buildMainNavigation(header, parent) {
    var nav = header.appendChild(_utils.create('nav', {class: 'navbar navbar-default'}));
    var brandModalContent = _utils.create('div', {class: 'center-block text-center'});
    createChild(brandModalContent, 'img', { src: '/image/prism.png', alt: "Blease"});
    createChild(brandModalContent, 'h3',  { class: 'text-primary' }, 'Blease');
    createChild(brandModalContent, 'p',  { class: 'text-default' }, 'Behavioral Requirement Management');
    createChild(brandModalContent, 'p',  { class: 'text-default' }, '(C) 2016 - Stephan Bruny');
    createChild(brandModalContent, 'p',  { class: 'text-default' }, 'Dual licensed under GPLv3 and commercial license');
    createChild(brandModalContent, 'br', {});
    var brandModal = _utils.createModal(brandModalContent, 'Blease');
    var navContainer = nav.appendChild(_utils.create('div', {class: 'container-fluid'}))
    var navHeader = createChild(navContainer, 'div', {class: 'navbar-header'});
    var brand = createChild(navHeader, 'a', {class: 'navbar-brand', href: '#'});
    brand.onclick = function() {
      _utils.show(brandModal)
    }
    createChild(brand, 'img', {src: '/image/prism.png', alt: 'Blease', width: 32, height: 32});
    var mainNav = createChild(navContainer, 'div', {class: 'collapse navbar-collapse', id: 'main-nav-collapsable'});
    var ul = createChild(mainNav, 'ul', { class: 'nav navbar-nav' });
    function createNavLink(name, route, icon) {
        var li = createChild(ul, 'li');
        var a = createChild(li, 'a', {href: '#', class: 'navbar-link'})
        if (icon) createChild(a, 'i', {class: 'glyphicon glyphicon-' + icon}, '&nbsp;');
        createChild(a, 'span', {}, name);
        a.onclick = function() {
          goto(parent, route);
          return false;
        }
    }
    createNavLink('Requirements', 'index', 'th-list');
    createNavLink('Fruit Board', 'fruit', 'apple');
    createNavLink('Users', 'users', 'user');
    createNavLink('Settings', 'settings', 'cog');
    var tools = createChild(mainNav, 'ul', {class: 'nav navbar-nav navbar-right'});
    createChild(createChild(tools, 'li'), 'a', {href: '#', class: 'glyphicon glyphicon-user'});
    createChild(createChild(tools, 'li'), 'a', {href: '#'}, _utils.store.get('user').name);
    createChild(createChild(tools, 'li'), 'a', {href: '#', class: 'glyphicon glyphicon-off'});
  }

  root.blease = {
    start: function(parent) {
      if (!document.cookie) {
        _utils.store.remove('user');
      }
      var currentUser = _utils.store.get('user');
      if (!currentUser) {
        return goto(parent, 'login', null, true);
      }
      buildMainNavigation(document.querySelector('#app-header'), parent);
      var lastUserRoute = _utils.store.get('lastRoute') || {};
      return goto(parent, lastUserRoute.path || 'index', lastUserRoute.options);
    }
  };

})(this);
