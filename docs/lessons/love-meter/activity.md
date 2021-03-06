# love meter blocks activity

Create a love meter with the micro:bit

### ~avatar avatar

### @video td/videos/love-meter-0

Welcome! This activity will help you create a love meter with the micro:bit. Let's get started!

### ~

Begin by registering an event with `on pin pressed` *P0* to know when someone is holding pin *P0* and pin *Gnd*.


```blocks
input.onPinPressed(TouchPin.P0, () => {
    
})

```

We are going to create a meter that displays a random number from *0* to *10*. We use *10* as `random number up to` returns a number between *0* and *n*.


```blocks
input.onPinPressed(TouchPin.P0, () => {
    let x = Math.random(10)
})

```

Finally, let's show that number on the micro:bit. You are registering an event handler that will execute on the BBC micro:bit whenever the user holds the GND pin with one hand, and presses pin 0 with the other hand, thus completing a circuit


```blocks
input.onPinPressed(TouchPin.P0, () => {
    let x = Math.random(10)
    basic.showNumber(x)
})

```

### ~avatar avatar

Excellent, you're ready to continue with the [challenges](/lessons/love-meter/challenges)

### ~

