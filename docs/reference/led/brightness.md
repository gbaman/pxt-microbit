# Brightness

Find how bright the [LED screen](/device/screen) is.

```sig
led.brightness();
```

### Returns

* a [Number](/reference/types/number) that means how bright the screen is, from `0` (darkest) to `255` (brightest). For example, the number `127` means the screen is halfway bright.

### Example: highest brightness

This program makes the screen completely bright if it is not that way already:

```blocks
if (led.brightness() < 255) {
    led.setBrightness(255)
}
```

### See also

[set brightness](/reference/led/set-brightness), [fade in](/reference/led/fade-in), [fade out](/reference/led/fade-out)

