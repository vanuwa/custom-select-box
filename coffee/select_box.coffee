SETTINGS =
  version: "0.0.0"
  env: "dev"
  url: "http://sbox.loc/"

SETTINGS.stylesheet = SETTINGS.url + 'stylesheets/select_box.css'

# utils 

puts = (msg) ->
  if SETTINGS.env is "dev" and console?
    console.log msg

block_event = (e) ->
  e = window.event if !e
  
  if e.stopPropagation
    e.stopPropagation()
  else
    e.cancelBubble = true

  if e.preventDefault
    e.preventDefault()
  else
    e.returnValue = false

bind = (element, event_name, listener, capturing) ->
  if element.addEventListener
    element.addEventListener event_name, listener, capturing
  else
    if element.attachEvent
      element.attachEvent 'on' + event_name, listener

trigger = (element, event_name) ->
  event = document.createEvent 'HTMLEvents'
  event.initEvent event_name, true, true
  if element.dispatchEvent
    element.dispatchEvent event
  else
    if element.fireEvent
      element.fireEvent event_name, event

unbind = (element, event_name, listener, capturing) ->
  if element.removeEventListener
    element.removeEventListener event_name, listener, capturing
  else
    if element.detachEvent
      element.detachEvent 'on' + event_name, listener

# main class

class SelectBox
  version: SETTINGS.version
  list_item_el_css_class_name: 'list_item'
  
  el: document.createElement 'div'
  header_el: document.createElement 'div'
  triangle_el: document.createElement 'div'
  list_wrapper_el: document.createElement 'div'
  list_el: document.createElement 'ul'
  slider_wrapper_el: document.createElement 'div'
  slider_el: document.createElement 'div'

  css: document.createElement 'link'
  
  parent_el: null

  models: []
  selected_item_el: null

  constructor: (models) ->

    @reset models

    @el.id = 'select_box'

    @header_el.id = 'select_box_header'
    @el.appendChild @header_el


    self = @

    @list_wrapper_el.id = 'select_box_list_wrapper'
    @el.appendChild @list_wrapper_el

    @list_el.id = 'select_box_items'
    @list_wrapper_el.appendChild @list_el

    @slider_wrapper_el.id = 'select_box_slider_wrapper'
    @list_wrapper_el.appendChild @slider_wrapper_el

    @slider_el.id = 'select_box_slider'
    @slider_wrapper_el.appendChild @slider_el

    @triangle_el.id = 'triangle'
    @el.appendChild @triangle_el

    @hide_item_list()

    bind @header_el, 'click', () ->
      if self.list_wrapper_el.style.display is 'none' then self.show_item_list() else self.hide_item_list()
    ,
    false

    bind @triangle_el, 'click', () ->
      if self.list_wrapper_el.style.display is 'none' then self.show_item_list() else self.hide_item_list()
    ,
    false

    @init_scrolling()


  show_item_list: () ->
    @list_wrapper_el.style.display = 'block'
    @update_scrolling()
    @

  hide_item_list: () ->
    @list_wrapper_el.style.display = 'none'
    @

  
  append_to: (node) ->
     if node? and node.appendChild?
      node.appendChild @el
      @parent_el = node
    @el

  disable: () ->
    @

  enable: () ->
    @


  # items manipulation

  reset: (models) ->
    models or (models = [])
    @clear()
    self = @
    ((item) ->
      self.add_item item
    )(model) for model in models
    @

  get_element_by_position: (position) ->
    list_item_el = null
    if position > 0 and position <= @list_el.childNodes.length
      list_item_el = @list_el.childNodes[position - 1]
    list_item_el

  select_by_position: (position) ->
    if (list_item_el = @get_element_by_position(position))?
      @header_el.innerHTML = list_item_el.innerHTML
      @selected_item_el = list_item_el
      @hide_item_list()
      trigger @el, 'change_selection'
    @

  select_by_id: (id) ->
    list_item_el = document.getElementById id
    if list_item_el?
      @header_el.innerHTML = list_item_el.innerHTML
      @selected_item_el = list_item_el
      @hide_item_list()
      trigger @el, 'change_selection'
    @

  get_selected_item: () ->
    item =
      id: @selected_item_el.id
      value: @selected_item_el.innerHTML

  get_items: () ->
    items = []
    ((elem) ->
      item =
        id: elem.id
        value: elem.innerHTML
      items.push item
    )(child) for child in @list_el.childNodes
    items

  add_item: (item) ->
    if item?
      list_item_el = document.createElement 'li'
      list_item_el.setAttribute 'class', @list_item_el_css_class_name
      list_item_el.id = item.id
      list_item_el.setAttribute 'value', item.value
      list_item_el.innerHTML = item.value
      @list_el.appendChild list_item_el
      @select_by_id item.id if !@selected_item_el

      @update_scrolling()

      self = @
      bind list_item_el, 'click', (e) ->
        self.select_by_id @id
      ,
      false
    @

  insert_item: (position, item) ->
    list_item_el = null
    if (next_list_item_el = @get_element_by_position(position))?
      list_item_el = document.createElement 'li'
      list_item_el.setAttribute 'class', @list_item_el_css_class_name
      list_item_el.id = item.id
      list_item_el.setAttribute 'value', item.value
      list_item_el.innerHTML = item.value
      @list_el.insertBefore list_item_el, next_list_item_el
    list_item_el

  remove_item_by_position: (position) ->
    item = null
    if (elem = @get_element_by_position position)?
      item =
        id: elem.id
        value: elem.innerHTML
      @list_el.removeChild elem
    item

  remove_item_by_id: (id) ->
    item = null
    elem = document.getElementById id
    if elem?
      item =
        id: id
        value: elem.innerHTML
      @list_el.removeChild elem
    item

  clear: () ->
    method1 = (ul) ->
      while ul.firstChild
        ul.removeChild ul.firstChild

    method2 = (ul) ->
      ul.innerHTML = ""

    method2 @list_el
    @header_el.innerHTML = ""
    @

  size: () ->
    @list_el.childNodes.length


  # events

  on_change_selection: (callback) ->
    bind @el, 'change_selection', callback, false
    @

  
  # scrolling

  init_scrolling: () ->

    @y0 = 0
    @slider_top0 = 0
    @mouse_down = false


    self = @
    bind @slider_el, 'mousedown', (e) ->
      puts 'slider mouse DOWN'
      e = window.event if !e
      self.mouse_down = true
      self.y0 = e.clientY
      self.slider_top0 = self.slider_el.offsetTop
      puts self.y0
      block_event e
      false
    ,
    false

    bind window, 'mousemove', (e) ->
      move_to = (position) ->
        
        slide_panel_height = self.slider_wrapper_el.offsetHeight
        slider_height = self.slider_el.offsetHeight
        position = self.slider_top0 + position

        if (position <= (slide_panel_height - slider_height)) and (position >= 0)
          self.slider_el.style.top = position + 'px'
        else
          if position > (slide_panel_height - slider_height)
            self.slider_el.style.top = slide_panel_height - slider_height + 'px'
          else
            self.slider_el.style.top = 0 + 'px'

        self.list_el.style.top = Math.round(parseInt(self.slider_el.style.top) * self.dx * (-1)) + 'px'

        false

      e = window.event if !e
      if self.mouse_down
        position = e.clientY - self.y0
        move_to e.clientY - self.y0
        block_event e
      false
    ,
    false

    bind window, 'mouseup', (e) ->
      puts 'window mouse UP'
      self.mouse_down = false
      false
    ,
    false

    @update_scrolling()


  update_scrolling: () ->
    visible_list_height = @list_wrapper_el.offsetHeight
    list_height = @list_el.offsetHeight
    slide_panel_height = @slider_wrapper_el.offsetHeight
    slider_height = Math.round (visible_list_height * slide_panel_height) / list_height
    slider_height = if slider_height > slide_panel_height then slide_panel_height else slider_height
    @slider_el.style.height = slider_height + 'px'

    @dx = list_height / slide_panel_height


this.SelectBox = SelectBox
