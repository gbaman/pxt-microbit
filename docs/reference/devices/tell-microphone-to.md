# tell microphone to

The tell microphone to function.

Access the audio recording capabilities of the device using the ``tell microphone to`` function.

The functions in the antenna namespace allow the BBC micro:bit to communicate with a separate (remote) device, such as a smartphone, over Bluetooth (Smart). The set of supported events will depend on the remote device and the BBC micro:bit apps available for the remote device.

### Block Editor

![](/static/mb/tell-microphone-to-0.png)

### JavaScript

```
export function tellMicrophoneTo(event: string)
```

### Parameters

* event - an event identifier

### Event values

* play
* stop
* pause
* forward
* rewind
* volume up
* volume down
* previous track
* next track

### Examples

To tell the connected device to start recording audio

```
devices.tellMicrophoneTo("start capture")
```

To tell the connected device to stop recording audio

```
devices.tellMicrophoneTo("stop capture")
```

### Other show functions

* use [tell remote control to](/reference/devices/tell-remote-control-to) to control presentation of media content
* use [tell camera to](/reference/devices/tell-camera-to) to control the photo/video recording of connected devices
* use [raise alert to](/reference/devices/raise-alert-to) to control the microphone of connected devices

### See also

[Devices](/reference/devices)

