# die roll challenges

Create a die on the micro:bit. 

## Before we get started

Complete the following [guided tutorial](/lessons/die-roll/activity), your code should look like this:

```blocks 
input.onGesture(Gesture.Shake, () => {
    let roll = Math.random(6);
    if (roll == 5) {
        basic.showLeds(`
. # . # .
. . . . .
. # . # .
. . . . .
. # . # .`);
    }
    else if (roll == 4) {
        basic.showLeds(`
. . . . .
. # . # .
. . # . .
. # . # .
. . . . .`);
    }
    else if (roll == 3) {
        basic.showLeds(`
. . . . .
. # . # .
. . . . .
. # . # .
. . . . .`);
    }
    else if (roll == 2) {
        basic.showLeds(`
# . . . .
. . . . .
. . # . .
. . . . .
. . . . #`);
    }
    else if (roll == 1) {
        basic.showLeds(`
. . . . .
. # . . .
. . . . .
. . . # .
. . . . .`);
    }
    else {
        basic.showLeds(`
. . . . .
. . . . .
. . # . .
. . . . .
. . . . .`);
    }
});
```

### Challenge 1

Modify the line of code with `pick random` so that only number 1-4 can appear on the die.


```blocks 
input.onGesture(Gesture.Shake, () => {
    let roll = Math.random(4);
    if (roll == 5) {
        basic.showLeds(`
. # . # .
. . . . .
. # . # .
. . . . .
. # . # .`);
    }
    else if (roll == 4) {
        basic.showLeds(`
. . . . .
. # . # .
. . # . .
. # . # .
. . . . .`);
    }
    else if (roll == 3) {
        basic.showLeds(`
. . . . .
. # . # .
. . . . .
. # . # .
. . . . .`);
    }
    else if (roll == 2) {
        basic.showLeds(`
# . . . .
. . . . .
. . # . .
. . . . .
. . . . #`);
    }
    else if (roll == 1) {
        basic.showLeds(`
. . . . .
. # . . .
. . . . .
. . . # .
. . . . .`);
    }
    else {
        basic.showLeds(`
. . . . .
. . . . .
. . # . .
. . . . .
. . . . .`);
    }
});
```

### Challenge 2

Let's make a trick die! Modify the line of code with `pick random` so that only numbers 3-6 can appear on the die. Also note that we need to ensure `roll = 0` when only 1 dot is shown on the BBC micro:bit.

```blocks 
input.onGesture(Gesture.Shake, () => {
    let roll = Math.random(4) + 2;
    if (roll == 5) {
        basic.showLeds(`
. # . # .
. . . . .
. # . # .
. . . . .
. # . # .`);
    }
    else if (roll == 4) {
        basic.showLeds(`
. . . . .
. # . # .
. . # . .
. # . # .
. . . . .`);
    }
    else if (roll == 3) {
        basic.showLeds(`
. . . . .
. # . # .
. . . . .
. # . # .
. . . . .`);
    }
    else if (roll == 2) {
        basic.showLeds(`
# . . . .
. . . . .
. . # . .
. . . . .
. . . . #`);
    }
    else if (roll == 1) {
        basic.showLeds(`
. . . . .
. # . . .
. . . . .
. . . # .
. . . . .`);
    }
    else {
        basic.showLeds(`
. . . . .
. . . . .
. . # . .
. . . . .
. . . . .`);
    }
});
```

### Challenge 3

Add a couple more conditions so that the BBC micro:bit randomly chooses a number between 1 and 8.

