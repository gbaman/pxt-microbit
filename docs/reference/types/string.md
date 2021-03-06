# String

a piece of text.

### @parent blocks/language

A *String* is a sequence of characters. For the BBC micro:bit, ASCII character codes 32 to 126 are supported; letters, digits, punctuation marks, and a few symbols. All other character codes appear as a ? on the [LED screen](/device/screen).

### Declare a string

Use the [var statement](/reference/variables/var) and the [assignment operator](/reference/variables/assign) to declare a new *local* string variable. Like this:

![](/static/mb/blocks/string-0.png)

To declare a string using the [Block Editor](/blocks/editor):

1. Click `Variables` (as the Block drawer).

2. Type a name for your new string variable by clicking the down arrow, then click New Variable. Then type the variable name "salutation"

2. Drag a string block on the right side of the operator.

3. Click `"Hello"` and then type a string like `hello`.

Your code should look something like this:

![](/static/mb/blocks/string-1.png)

### The function `show string`

Use [show string](/reference/basic/show-string) to display a string on the [LED screen](/device/screen). If the string is multiple characters, the string scrolls right to left. The following example displays `Hello world!` on the micro:bit screen:

![](/static/mb/blocks/string-2.png)

The  parameter of `show string` specifies the string

### Lessons

[glowing pendulum](/lessons/glowing-pendulum), [zoomer](/lessons/zoomer), [temperature](/lessons/temperature)

### See also

[variables](/reference/variables/var), [string functions](/reference/types/string-functions), [Number](/reference/types/number), [show string](/reference/basic/show-string)

