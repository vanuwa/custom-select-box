(function() {
  SETTINGS = {
    version: '0.0.1',
    env: 'dev'
  };

      // SelectBox class

  var SelectBox = (function() {

    var self = null;
    var dx = 0;
    var y0 = 0;
    var slider_top0 = 0;
    var mouse_down = false;
    var li_css_class_name = 'list_item';
    var selected_item = null;
    var header_background = null;
    var change_selection_event_name = 'scroll';       // IE supported naming

    function SelectBox(models) {
      
      self = this;

      this.el = document.createElement('div');
      this.el.id = 'select_box';

      this.header = document.createElement('div');
      this.header.id = 'select_box_header';

      this.triangle = document.createElement('div');
      this.triangle.id = 'triangle';

      this.list_wrapper = document.createElement('div');
      this.list_wrapper.id = 'select_box_list_wrapper';

      this.list = document.createElement('ul');
      this.list.id = 'select_box_list_items';

      this.scroll_bar = document.createElement('div');
      this.scroll_bar.id = 'select_box_slider_wrapper';

      this.slider = document.createElement('div');
      this.slider.id = 'select_box_slider';

      this.el.appendChild(this.header);
      this.el.appendChild(this.list_wrapper);
      this.list_wrapper.appendChild(this.list);
      this.list_wrapper.appendChild(this.scroll_bar);
      this.scroll_bar.appendChild(this.slider);
      this.el.appendChild(this.triangle);

      bind(this.header, 'click', header_on_click, false);
      bind(this.triangle, 'click', header_on_click, false);

      initialize_scrolling();

      hide_list();

      this.reset(models);

    }

    // append SelectBox element to container element
    SelectBox.prototype.append_to = function(node) {
      if (typeof node !== 'undefined' && node.appendChild) {
        node.appendChild(this.el);
        return this.el;
      }
      return null;
    };

    // select an element by id
    /*
    SelectBox.prototype.select_by_id = function(id) {
      var li = document.getElementById(id);
      if(li !== null) {
        this.header.innerHTML = li.innerHTML;
        selected_item = li;
        hide_list();
        trigger(this.el, 'change_selection');
      }
      return li;
    };
    */

    // returns selected item model like {id: 'first', value: 'FIRST'}
    SelectBox.prototype.get_selected_item = function() {
      return selected_item ? ({id: selected_item.id, value: selected_item.innerHTML}) : null;
    };

    // returns collestion of models, like [{id: 'first', value:'FIRST'}, {id: 'second', value: 'SECOND'}, {id: 'third', value:'VALUE'}]
    SelectBox.prototype.get_items = function() {
      var items = [];
      if (this.el) {
        for (var i = 0; i < this.el.childNodes.length; i++) {
          var child = this.el.childNodes[i];
          items.push({
            id: child.id,
            value: child.innerHTML
          });
        }
      }
      return items;
    };

    // add an item to the list of items
    SelectBox.prototype.add_item = function(item) {
      var li = null;
      if (item !== null) {
        li = build_list_item(item);
        this.list.appendChild(li);
        update_scroller_height();
      }
      return li;
    };

    // insert an item in certain position
    SelectBox.prototype.insert_item = function(position, item) {
      var li = null;
      var next_li = null;
      if ((next_li = get_element_by_position(position)) !== null) {
        li = build_list_item(item);
        this.list.insertBefore(li, next_li);
      } else if (position === 0 && self.list.childNodes.length === 0) {
        self.add_item(item);
      }
      update_scroller_height();
      return li;
    };

    // remove list item using it position; returns deleted model
    SelectBox.prototype.remove_item_by_position = function(position) {
      return remove_list_item(self.get_element_by_position(position));
    };

    // remove list item using it id; returns deleted model
    SelectBox.prototype.remove_item_by_id = function(id) {
      return remove_list_item(document.getElementById(id));
    };

    SelectBox.prototype.remove_all = function() {
      var method1 = function(ul) {
        while(ul.firstChild) {
          ul.removeChild(ul.firstChild);
        }
      };

      var method2 = function(ul) {
        ul.innerHTML = "";
      };

      method2(self.list);
      self.header.innerHTML = "";

      return self;
    };

    // replace current items with a new list of items
    SelectBox.prototype.reset = function(models) {
      models || (models = []);

      self.remove_all();

      for (var i = 0; i < models.length; i++) {
        this.add_item(models[i]);
      }
      return this;
    };

    // select item by position and show it in the header 
    SelectBox.prototype.select_by_position = function(position) {
      select_element(get_element_by_position(position)); 
      return self;
    };

    // select item by id and show it in the header
    SelectBox.prototype.select_by_id = function(id) {
      select_element(document.getElementById(id));
      return self;
    };

    // select by value; show it in header
    SelectBox.prototype.select_by_value = function(value) {
      var element = null;
      for (var i = 0; i < self.list.childNodes.length; i++) {
        if ((element = self.list.childNodes[i]).innerHTML === value) {
          select_element(element);
          break;
        }
      }
    };

    // returns length of collection
    SelectBox.prototype.size = function() {
      return self.list.childNodes.length;
    };

    SelectBox.prototype.on_change_selection = function(callback) {
      bind(self.el, change_selection_event_name, callback, false);
      return self;
    };

    SelectBox.prototype.disable = function() {
      hide_list();
      unbind(self.header, 'click', header_on_click, false);
      unbind(self.triangle, 'click', header_on_click, false);
      header_background = self.header.style.background;
      self.header.style.background = '#DBDBDB';
    };

    SelectBox.prototype.enable = function() {
      bind(self.header, 'click', header_on_click, false);
      bind(self.triangle, 'click', header_on_click, false);
      self.header.style.background = header_background;
    };


    // private methods and helpers
      
    // listener for drop-down / "undrop-down" list of items
    var header_on_click = function() {
      (self.list_wrapper.style.display === 'none' ? show_list : hide_list)();
    };

    // listener: hold scroller
    var slider_on_mousedown = function(e) {
      e || (e = window.event);
      mouse_down = true;
      y0 = e.clientY;
      slider_top0 = self.slider.offsetTop;
      puts(y0 + " -> " + slider_top0);
      block_event(e);
      //dx = self.list.offsetHeight / self.scroll_bar.offsetHeight;
      return false;
    };

    // listener: scroller follows mouse pointer
    var slider_on_mousemove = function(e) {
      var move_to = function(position) {
        var diff = self.scroll_bar.offsetHeight - self.slider.offsetHeight;

        position = slider_top0 + position;
        if (position <= diff && position >= 0) {
          self.slider.style.top = position + 'px';
        } else if (position > diff) {
          self.slider.style.top = diff + 'px';
        } else {
          self.slider.style.top = 0 + 'px';
        }

        self.list.style.top = Math.round(parseInt(self.slider.style.top) * dx * (-1)) + 'px';
        return false;
      };
      
      e || (e = window.event);
      if (mouse_down) {
        move_to(e.clientY - y0);
        block_event(e);
      }
      return false;
    };

    // listener: unhold scroller
    var slider_on_mouseup = function(e) {
      mouse_down = false;
      return false;
    };

    // print some messages and debug information
    var puts = function(msg) {
      if (SETTINGS.env === 'dev' && (typeof console !== 'undefined' && console !== null)) {
        console.log(msg);
      }
    };

    // "clearing" events
    var block_event = function(e) {
      if (!e) e = window.event;
      if (e.stopPropagation) {
        e.stopPropagation();
      } else {
        e.cancelBubble = true;
      }
      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
    };

    // subscribe on certain events from certain element (cross-browser version)
    var bind = function(element, event_name, listener, capturing) {
      if (element.addEventListener) {
        element.addEventListener(event_name, listener, capturing);
      } else if (element.attachEvent) {
        element.attachEvent('on' + event_name, listener);
      }
    };

    // unsubscribe from events of certain element (cross-browser version)
    var unbind = function(element, event_name, listener, capturing) {
      if (element.removeEventListener) {
        element.removeEventListener(event_name, listener, capturing);
      } else if (element.detachEvent) {
        element.detachEvent('on' + event_name, listener);
      }
    };

    // trigger an event (cross-browser version)
    var trigger = function(element, event_name, event_type) {
      var event = null;

      if (document.createEvent) {
        event = document.createEvent(event_type);
        event.initEvent(event_name, true, true);
      } else if (document.createEventObject) {
        event = document.createEventObject();
      }

      if (element.dispatchEvent) {
        element.dispatchEvent(event);
      } else if (element.fireEvent) {
        element.fireEvent(event_name);
      }
    };

    // drop-down the list of items
    var show_list = function() {
      self.list_wrapper.style.display = 'block';
      update_scroller_height();
    };

    // 'un-drop-down' the list of items
    var hide_list = function() {
      self.list_wrapper.style.display = 'none';
      update_scroller_height();
    };

    // get item model in certain position
    var get_element_by_position = function(position) {
      var li = null;
      if (position > 0 && position <= self.list.childNodes.length) {
        li = self.list.childNodes[position - 1];
      }
      return li;
    };

    // helper function for create list item element from model
    var build_list_item = function(item) {
      var li = document.createElement('li');
      li.id = item.id;
      li.setAttribute('class', li_css_class_name);
      li.setAttribute('value', item.value);
      li.innerHTML = item.value;
      bind(li, 'click', function(e) {
        e || (e = window.event);
        puts( 'this : ' + this + ", srcElement : " + e.srcElement + ", target : " + e.target);
        var element = null;
        if (typeof e.target !== 'undefined') {
          element = e.target;
        } else if (typeof e.srcElement !== 'undefined'){
          element = e.srcElement;
        }
        select_element(element);
        //self.select_by_id(this.id)
      }, false);
      if (!selected_item) self.select_by_id(item.id);
      return li;
    };

    // helper function for remove list item element; returns model of list item
    var remove_list_item = function(element) {
      var model = null;
      if (typeof element !== 'undefined' && element !== null) {
        model = {
          id: element.id,
          value: element.innerHTML
        };
        self.list.removeChild(element);
      }
      return model;
    };

    var select_element = function(element) {
      if (typeof element !== 'undefined' && element !== null) {
        self.header.innerHTML = element.innerHTML;
        selected_item = element;
        hide_list();
        trigger(self.el, change_selection_event_name, 'HTMLEvents');
      }
      return self;
    };

    // update scroller height depends of list content (items count)
    var update_scroller_height = function() {
      var visible_list_height = self.list_wrapper.offsetHeight;
      var list_height = self.list.offsetHeight;
      var scroll_bar_height = self.scroll_bar.offsetHeight;
      var slider_height = Math.round((visible_list_height * scroll_bar_height) / list_height);
      slider_height = slider_height > scroll_bar_height ? scroll_bar_height : slider_height;
      self.slider.style.height = isNaN(slider_height) ? '' : slider_height + 'px';
      dx = list_height / scroll_bar_height;
      return slider_height;
    };

    var initialize_scrolling = function() {
      mouse_down = false;

      bind(self.slider, 'mousedown', slider_on_mousedown, false);
      bind(document, 'mousemove', slider_on_mousemove, false);        // document instead of window because of ie8
      bind(document, 'mouseup', slider_on_mouseup, false);            // document instead of window because of ie8
    };

    return SelectBox;
  
  })();

  this.SelectBox = SelectBox;


}).call(this);
