# Receive Number

The broadcast function.

Reads the next radio packet as a number data packet.

## Important Security Consideration

The functions in the ``radio`` namespace allow the BBC micro:bit to communicate with other micro:bits.

This API does not contain any form of encryption, authentication or authorization. It's purpose is solely for use as a teaching aid to demonstrate how simple communications operates, and to provide a sandpit through which learning can take place.

For serious applications, BLE should be considered a substantially more secure alternative.

```sig
radio.receiveNumber();
```

### Returns

* packet - a number received.

### Examples

Broadcasts the value of ``acceleration`` x to other micro:bits.

```
radio.onDataReceived(() => {
    led.plotBarGraph(radio.receiveNumber(), 1023)
})
```

### See also

[send number](/reference/radio/send-number), [receive number](/reference/radio/receive-number), [on data received](/reference/radio/on-data-received), [set group](/reference/radio/set-group)

