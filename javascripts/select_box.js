(function() {
  var SETTINGS, SelectBox, bind, block_event, puts, trigger, unbind;

  SETTINGS = {
    version: "0.0.0",
    env: "dev",
    url: "http://sbox.loc/"
  };

  SETTINGS.stylesheet = SETTINGS.url + 'stylesheets/select_box.css';

  puts = function(msg) {
    if (SETTINGS.env === "dev" && (typeof console !== "undefined" && console !== null)) {
      return console.log(msg);
    }
  };

  block_event = function(e) {
    if (!e) e = window.event;
    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }
    if (e.preventDefault) {
      return e.preventDefault();
    } else {
      return e.returnValue = false;
    }
  };

  bind = function(element, event_name, listener, capturing) {
    if (element.addEventListener) {
      return element.addEventListener(event_name, listener, capturing);
    } else {
      if (element.attachEvent) {
        return element.attachEvent('on' + event_name, listener);
      }
    }
  };

  trigger = function(element, event_name) {
    var event;
    event = document.createEvent('HTMLEvents');
    event.initEvent(event_name, true, true);
    if (element.dispatchEvent) {
      return element.dispatchEvent(event);
    } else {
      if (element.fireEvent) return element.fireEvent(event_name, event);
    }
  };

  unbind = function(element, event_name, listener, capturing) {
    if (element.removeEventListener) {
      return element.removeEventListener(event_name, listener, capturing);
    } else {
      if (element.detachEvent) {
        return element.detachEvent('on' + event_name, listener);
      }
    }
  };

  SelectBox = (function() {

    SelectBox.prototype.version = SETTINGS.version;

    SelectBox.prototype.list_item_el_css_class_name = 'list_item';

    SelectBox.prototype.el = document.createElement('div');

    SelectBox.prototype.header_el = document.createElement('div');

    SelectBox.prototype.triangle_el = document.createElement('div');

    SelectBox.prototype.list_wrapper_el = document.createElement('div');

    SelectBox.prototype.list_el = document.createElement('ul');

    SelectBox.prototype.slider_wrapper_el = document.createElement('div');

    SelectBox.prototype.slider_el = document.createElement('div');

    SelectBox.prototype.css = document.createElement('link');

    SelectBox.prototype.parent_el = null;

    SelectBox.prototype.models = [];

    SelectBox.prototype.selected_item_el = null;

    function SelectBox(models) {
      var self;
      this.reset(models);
      this.el.id = 'select_box';
      this.header_el.id = 'select_box_header';
      this.el.appendChild(this.header_el);
      self = this;
      this.list_wrapper_el.id = 'select_box_list_wrapper';
      this.el.appendChild(this.list_wrapper_el);
      this.list_el.id = 'select_box_items';
      this.list_wrapper_el.appendChild(this.list_el);
      this.slider_wrapper_el.id = 'select_box_slider_wrapper';
      this.list_wrapper_el.appendChild(this.slider_wrapper_el);
      this.slider_el.id = 'select_box_slider';
      this.slider_wrapper_el.appendChild(this.slider_el);
      this.triangle_el.id = 'triangle';
      this.el.appendChild(this.triangle_el);
      this.hide_item_list();
      bind(this.header_el, 'click', function() {
        if (self.list_wrapper_el.style.display === 'none') {
          return self.show_item_list();
        } else {
          return self.hide_item_list();
        }
      }, false);
      bind(this.triangle_el, 'click', function() {
        if (self.list_wrapper_el.style.display === 'none') {
          return self.show_item_list();
        } else {
          return self.hide_item_list();
        }
      }, false);
      this.init_scrolling();
    }

    SelectBox.prototype.show_item_list = function() {
      this.list_wrapper_el.style.display = 'block';
      this.update_scrolling();
      return this;
    };

    SelectBox.prototype.hide_item_list = function() {
      this.list_wrapper_el.style.display = 'none';
      return this;
    };

    SelectBox.prototype.append_to = function(node) {
      if ((node != null) && (node.appendChild != null)) {
        node.appendChild(this.el);
        return this.parent_el = node;
      }
    };

    SelectBox.el;

    SelectBox.prototype.disable = function() {
      return this;
    };

    SelectBox.prototype.enable = function() {
      return this;
    };

    SelectBox.prototype.reset = function(models) {
      var model, self, _fn, _i, _len;
      models || (models = []);
      this.clear();
      self = this;
      _fn = function(item) {
        return self.add_item(item);
      };
      for (_i = 0, _len = models.length; _i < _len; _i++) {
        model = models[_i];
        _fn(model);
      }
      return this;
    };

    SelectBox.prototype.get_element_by_position = function(position) {
      var list_item_el;
      list_item_el = null;
      if (position > 0 && position <= this.list_el.childNodes.length) {
        list_item_el = this.list_el.childNodes[position - 1];
      }
      return list_item_el;
    };

    SelectBox.prototype.select_by_position = function(position) {
      var list_item_el;
      if ((list_item_el = this.get_element_by_position(position)) != null) {
        this.header_el.innerHTML = list_item_el.innerHTML;
        this.selected_item_el = list_item_el;
        this.hide_item_list();
        trigger(this.el, 'change_selection');
      }
      return this;
    };

    SelectBox.prototype.select_by_id = function(id) {
      var list_item_el;
      list_item_el = document.getElementById(id);
      if (list_item_el != null) {
        this.header_el.innerHTML = list_item_el.innerHTML;
        this.selected_item_el = list_item_el;
        this.hide_item_list();
        trigger(this.el, 'change_selection');
      }
      return this;
    };

    SelectBox.prototype.get_selected_item = function() {
      var item;
      return item = {
        id: this.selected_item_el.id,
        value: this.selected_item_el.innerHTML
      };
    };

    SelectBox.prototype.get_items = function() {
      var child, items, _fn, _i, _len, _ref;
      items = [];
      _ref = this.list_el.childNodes;
      _fn = function(elem) {
        var item;
        item = {
          id: elem.id,
          value: elem.innerHTML
        };
        return items.push(item);
      };
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _fn(child);
      }
      return items;
    };

    SelectBox.prototype.add_item = function(item) {
      var list_item_el, self;
      if (item != null) {
        list_item_el = document.createElement('li');
        list_item_el.setAttribute('class', this.list_item_el_css_class_name);
        list_item_el.id = item.id;
        list_item_el.setAttribute('value', item.value);
        list_item_el.innerHTML = item.value;
        this.list_el.appendChild(list_item_el);
        if (!this.selected_item_el) this.select_by_id(item.id);
        this.update_scrolling();
        self = this;
        bind(list_item_el, 'click', function(e) {
          return self.select_by_id(this.id);
        }, false);
      }
      return this;
    };

    SelectBox.prototype.insert_item = function(position, item) {
      var list_item_el, next_list_item_el;
      list_item_el = null;
      if ((next_list_item_el = this.get_element_by_position(position)) != null) {
        list_item_el = document.createElement('li');
        list_item_el.setAttribute('class', this.list_item_el_css_class_name);
        list_item_el.id = item.id;
        list_item_el.setAttribute('value', item.value);
        list_item_el.innerHTML = item.value;
        this.list_el.insertBefore(list_item_el, next_list_item_el);
      }
      return list_item_el;
    };

    SelectBox.prototype.remove_item_by_position = function(position) {
      var elem, item;
      item = null;
      if ((elem = this.get_element_by_position(position)) != null) {
        item = {
          id: elem.id,
          value: elem.innerHTML
        };
        this.list_el.removeChild(elem);
      }
      return item;
    };

    SelectBox.prototype.remove_item_by_id = function(id) {
      var elem, item;
      item = null;
      elem = document.getElementById(id);
      if (elem != null) {
        item = {
          id: id,
          value: elem.innerHTML
        };
        this.list_el.removeChild(elem);
      }
      return item;
    };

    SelectBox.prototype.clear = function() {
      var method1, method2;
      method1 = function(ul) {
        var _results;
        _results = [];
        while (ul.firstChild) {
          _results.push(ul.removeChild(ul.firstChild));
        }
        return _results;
      };
      method2 = function(ul) {
        return ul.innerHTML = "";
      };
      method2(this.list_el);
      this.header_el.innerHTML = "";
      return this;
    };

    SelectBox.prototype.size = function() {
      return this.list_el.childNodes.length;
    };

    SelectBox.prototype.on_change_selection = function(callback) {
      bind(this.el, 'change_selection', callback, false);
      return this;
    };

    SelectBox.prototype.init_scrolling = function() {
      var self;
      this.y0 = 0;
      this.slider_top0 = 0;
      this.mouse_down = false;
      self = this;
      bind(this.slider_el, 'mousedown', function(e) {
        puts('slider mouse DOWN');
        if (!e) e = window.event;
        self.mouse_down = true;
        self.y0 = e.clientY;
        self.slider_top0 = self.slider_el.offsetTop;
        puts(self.y0);
        block_event(e);
        return false;
      }, false);
      bind(window, 'mousemove', function(e) {
        var move_to, position;
        move_to = function(position) {
          var slide_panel_height, slider_height;
          slide_panel_height = self.slider_wrapper_el.offsetHeight;
          slider_height = self.slider_el.offsetHeight;
          position = self.slider_top0 + position;
          if ((position <= (slide_panel_height - slider_height)) && (position >= 0)) {
            self.slider_el.style.top = position + 'px';
          } else {
            if (position > (slide_panel_height - slider_height)) {
              self.slider_el.style.top = slide_panel_height - slider_height + 'px';
            } else {
              self.slider_el.style.top = 0 + 'px';
            }
          }
          self.list_el.style.top = Math.round(parseInt(self.slider_el.style.top) * self.dx * (-1)) + 'px';
          return false;
        };
        if (!e) e = window.event;
        if (self.mouse_down) {
          position = e.clientY - self.y0;
          move_to(e.clientY - self.y0);
          block_event(e);
        }
        return false;
      }, false);
      bind(window, 'mouseup', function(e) {
        puts('window mouse UP');
        self.mouse_down = false;
        return false;
      }, false);
      return this.update_scrolling();
    };

    SelectBox.prototype.update_scrolling = function() {
      var list_height, slide_panel_height, slider_height, visible_list_height;
      visible_list_height = this.list_wrapper_el.offsetHeight;
      list_height = this.list_el.offsetHeight;
      slide_panel_height = this.slider_wrapper_el.offsetHeight;
      slider_height = Math.round((visible_list_height * slide_panel_height) / list_height);
      slider_height = slider_height > slide_panel_height ? slide_panel_height : slider_height;
      this.slider_el.style.height = slider_height + 'px';
      return this.dx = list_height / slide_panel_height;
    };

    return SelectBox;

  })();

  this.SelectBox = SelectBox;

}).call(this);
