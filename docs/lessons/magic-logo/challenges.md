# magic logo challenges

Coding challenges for magic logo.

## Before we get started

Complete the [magic logo](/lessons/magic-logo/activity) activity and your code will look like this:

```blocks
input.onLogoUp(() => {
    basic.showLeds(`
        . . # . .
        . # # # .
        # # # # #
        . . # . .
        . . # . .
        `)
})

```


### Challenge 1

How about when the logo is down? We should display an arrow pointing downward!

### @video td/videos/magic-logo-1-2

```blocks
input.onLogoUp(() => {
    basic.showLeds(`
        . . # . .
        . # # # .
        # # # # #
        . . # . .
        . . # . .
        `)
})
input.onLogoDown(() => {
    basic.showLeds(`
        . . # . .
        . . # . .
        # # # # #
        . # # # .
        . . # . .
        `)
})


```


### Challenge 2

Use the `on screen up` event to show a spinning arrow when the screen is turned up.

### Challenge 3

Display another animation using the `on screen up` event.

