# Custom SelectBox UI Control

## Usage

Include `javascripts/custom_select_box.js` and `stylesheets/select_box.css` into your web-page.

```javascript
var items = [{id:'id_which_never_intersects_with_others', value:'Hello world!'}];
var sbox = new SelectBox(items);                      // create new instance
sbox.append_to(<your_container_element>);             // append sbox element to container element on the page
sbox.select_by_id('element_id');                      // select element by id
sbox.select_by_position(3);                           // position (not index) of element in the list, starts from 1 (not 0)
sbox.select_by_value('Infinity');                     // select element using value
sbox.get_selected_item();                             // returns selected item model {id:'element_id', value:'Hello world!'}
sbox.get_items();                                     // returns array of the models [{id:'element_1', value:'First'}, {id:'element_2', value:'Second'}]
sbox.add_item({id:'li_el', value:'Infinity'});        // add model item to the tail of the list
sbox.insert_item(4, {id:'fourth', value:'Fourth'});   // insert model item () into certain position
sbox.remove_item_by_position(6);                      // remove item from the list using it position (not index), returns deleted item
sbox.remove_item_by_id('element_id');                 // remove ite, from the list using it id, return deleted item
sbox.remove_all();                                    // clear collection
sbox.size();                                          // returns items count
sbox.on_change_selection(callback);                   // subscribe on change selection event
sbox.reset(items);                                    // replace current collection of items with new one
sbox.enable();                                        // enable element
sbox.disable();                                       // disable element
```

etc.

## Support
Firefox, Google Chrome, IE7, IE8

_Not tested_: IE6, IE9, Opera, Safari


P.S. to be continued :)
