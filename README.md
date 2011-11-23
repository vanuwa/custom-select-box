# Custom SelectBox UI Control

## Usage

Include `javascripts/select_box.js` and `stylesheets/select_box.css` into your web-page.

Then

```javascript
var items = [{id:'id_which_never_intersects_with_others', value:'Hello world!'}];
var sbox = new SelectBox(items);             // create new instance
sbox.append_to(<your_container_element>);    // append sbox element to container element on the page
```

etc.

## Support
 Firefox, Google Chrome
 Not tested IE, Opera, Safari

P.S. to be continued :)
