(function(root) {
  var rpcId = 0;

  function rpcRequest(action, params, callback, onError) {
    var xhr = new XMLHttpRequest();
    onError = onError || function(err) { console.error(err); }
    xhr.open("POST", '/');
    xhr.setRequestHeader("Content-type", "application/json");
    //.bind ensures that this inside of the function is the XHR object.
    xhr.onreadystatechange = function() {
      try {
        if (xhr.readyState === 4) {
          let res = JSON.parse(xhr.responseText);
          callback(res.result);
        }
      } catch (ex) {
        onError(ex);
      }
    };

    //All preperations are clear, send the request!
    xhr.send(JSON.stringify({
      jsonrpc: "2.0",
      id: (rpcId++).toString(),
      method: action,
      params: params
    }));
  }

  function getById(id) {
    return document.getElementById(id);
  }

  function query(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function queryAll(selector, parent) {
    return Array.prototype.slice.call( (parent || document).querySelectorAll(selector));
  }

  function create(tag, attributes, inner) {
    let result = document.createElement(tag);
    if (attributes) {
      for (var key in attributes) {
        result.setAttribute(key, attributes[key]);
      }
    }
    if (inner) result.innerHTML = inner;
    return result;
  }

  function hide(el) {
    return el.setAttribute('style', 'display: none');
  }

  function show(el) {
    el.setAttribute('style', 'display: block');
  }

  function append(parent, children) {
    for (var i = 0; i < children.length; i++) {
      parent.appendChild(children[i]);
    }
  }

  function createModal(content, title, buttons) {
    var modal = create('div', { class: 'modal', style: 'display: none' });
    var modalContent = create('div', { class: 'modal-content container' });
    var modalContentInner = create('div', { class: 'row modal-content-inner' });
    var modalTitle = create('div', { class: 'modal-title'});
    modalTitle.appendChild(create('strong', null, title || "Modal"));
    modalContentInner.appendChild(content);
    var modalButtons = create('div', { class: 'modal-buttons container' });
    var modalButtonsRow = create('div', { class: 'row' });

    var closeButton = create('button', { class: 'button button-outline' }, _str('Close'));
    closeButton.onclick = function() {
      hide(modal);
    }
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(modalContentInner);
    modalContent.appendChild(modalButtons);
    modalButtons.appendChild(modalButtonsRow);
    modalButtonsRow.appendChild(closeButton);
    if (buttons) {
      for (var i = 0; i < buttons.length; i++) {
        modalButtonsRow.appendChild(buttons[i]);
      }
    }
    modal.appendChild(modalContent);

    document.body.appendChild(modal);
    return modal;
  }

  let store = {
    set: (name, data) =>
      sessionStorage[name] ?
        sessionStorage[name] = JSON.stringify(data)
        : sessionStorage.setItem(name, JSON.stringify(data)),
    get: (name) => {
      console.log(name, sessionStorage)
      try {
        return sessionStorage[name] ? JSON.parse(sessionStorage[name]) : null;
      } catch (ex) {
        console.error("Storage: no value found for " + name);
        return null;
      }
    },
    remove: name => sessionStorage.removeItem(name)
  }

  function defaultTableDelegate(key) {
    return function(item) {
      return document.createTextNode(item[key])
    }
  }

  function addTableData(table, headDelegate, model) {
    var tbody = table.querySelector('tbody');
    for (var i = 0; i < model.length; i++) {
      var tr = create('tr');
      for (var key in headDelegate) {
        var td = create('td');
        td.appendChild(headDelegate[key].delegate(model[i]));
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
  }

  function createTable(attributes, head, model) {
    var result = create('table', attributes);
    var thead = create('thead');
    var tbody = create('tbody');
    var theadTr = create('tr');
    for (var key in head) {
      head[key].delegate = head[key].delegate || defaultTableDelegate(key);
      var th = create('th', head[key].attributes, head[key].name);
      th.setAttribute('data-ref', key);
      theadTr.appendChild(th);
    }

    thead.appendChild(theadTr);

    append(result, [thead, tbody]);

    if (model) addTableData(result, head, model);

    return result;
  }

  function getElementClasses(el) {
    var classes = el.getAttribute('class');
    if (classes) {
      return classes.split(' ');
    }
    return [];
  }

  function setClass(el, cssClass) {
    var classList = getElementClasses(el);
    if (classList.indexOf(cssClass) === -1) {
      classList.push(cssClass);
      return el.setAttribute('class', classList.join(' '));
    }
  }

  function removeClass(el, cssClass) {
    var classList = getElementClasses(el);
    var index = classList.indexOf(cssClass);
    if (index !== -1) {
      classList.splice(index, 1);
      return el.setAttribute('class', classList.join(' '));
    }
  }

  root._store = store;

  root._utils = {
    /**
     * Takes a form node and sends it over AJAX.
     * @param {HTMLFormElement} form - Form node to send
     * @param {function} callback - Function to handle onload.
     *                              this variable will be bound correctly.
     */
    sendRpc: rpcRequest,
    create: create,
    queryAll: queryAll,
    query: query,
    getById: getById,
    show: show,
    hide: hide,
    store: store,
    append: append,
    createTable: createTable,
    addTableData: addTableData,
    setClass: setClass,
    removeClass: removeClass,
    createModal: createModal,
    clearNode: function(node) {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    },
    ajaxPost: function (form, delegates, callback, onError) {
      onError = onError || function(err) { console.error(err); }
      var url = form.getAttribute('action');

      var formElements = Array.prototype.slice.call(form.elements);
      var params = {};
      function defaultDelegate(el) { return el.value };
      for (var i = 0; i < formElements.length; i++) {
        var el = formElements[i];
        if (!el.name || el.disabled || !!!el.value) continue;
        var value = delegates[el.name] ? delegates[el.name](el) : el.value;
        console.log(value)
        if (params[el.name]) {
          if (Array.isArray(params[el.name])) {
            params[el.name].push(value);
          } else {
            params[el.name] = [params[el.name], value];
          }
          continue;
        }
        params[el.name] = value;
      }

      return rpcRequest(url, params, callback, onError);
    }
  }
})(this)
