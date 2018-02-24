# micro:bit target for PXT

This target allows you to program a [BBC micro:bit](https://microbit.org/) using 
PXT ([Microsoft Programming Experience Toolkit](https://github.com/Microsoft/pxt)).

* [Try it live](https://makecode.microbit.org)

[![Build Status](https://travis-ci.org/Microsoft/pxt-microbit.svg?branch=master)](https://travis-ci.org/Microsoft/pxt-microbit)

## Issue tracking

Please add an issue if you discover an (unreported) bug.

## Local server

The local server lets you to run the editor and serve the documentation from your own computer.

### Setup

The following commands perform a one-time setup after synching the repo on your machine.
* Note for any editing of the .cpp files, Yotto must be installed. Do do so, follow the instructions on [their site](http://docs.yottabuild.org/).
* Install requirements for [pxt](https://github.com/Microsoft/pxt). Note the v0 branch must be used for pxt-microbit (add ``sudo`` for Mac/Linux shells).
```
npm install -g jake
npm install -g typings
```

* [Clone the pxt repository](https://help.github.com/articles/cloning-a-repository/) and set it to the v0 branch.
```
git clone https://github.com/microsoft/pxt
cd pxt
git checkout v0
```

* Install the pxt dependencies.
```
npm install
typings install
jake
cd ../
```

* [Clone this repo](https://help.github.com/articles/cloning-a-repository/) to your computer.
```
git clone https://github.com/microsoft/pxt-microbit
cd pxt-microbit
```
* install the PXT command line (add ``sudo`` for Mac/Linux shells).
```
npm install -g pxt
```
* install the dependencies
```
npm install

```

* Link pxt-microbit back to base pxt repo.
```
npm link ../pxt
```
Note the above command assumes the folder structure of   
```
       makecode
          |
  -----------------
  |               |
 pxt        pxt-microbit
 ```

### Running

Run this command from inside pxt-microbit to open a local web server (add ``sudo`` for Mac/Linux shells)
```
pxt serve --cloud
```
If the local server opens in the wrong browser, make sure to copy the URL containing the local token. 
Otherwise, the editor will not be able to load the projects.

If you need modify the `.cpp` files, enable yotta compilation by removing the ```--cloud``` flag (add ``sudo`` for Mac/Linux shells):
```
pxt serve
```



## Updates

To update your PXT version and make sure you're running the latest tools, run (add ``sudo`` for Mac/Linux shells):
```
pxt update
```

More instructions are at https://github.com/Microsoft/pxt#running-a-target-from-localhost 

## Testing

The build also automatically runs the following checks:

* make sure the built-in packages compile
* `pxt run` in `libs/lang-test*` - this will run the test in command line runner; 
  there is a number of asserts in both of these
* `pxt testdir` in `tests` - this makes sure all the files compile and generates .hex files
* run the TD->TS converter on a number of test scripts from `microbit.co.uk` and make sure the results compile

To test something on the device:

* do a `pxt deploy` in `libs/lang-test*` - they should show `1` or `2` on the screen (and not unhappy face)
* run `pxt testdir` in `tests` and deploy some of the hex files from `tests/built`

The `lang-test0` source comes from the `pxt-core` package. It's also tested with `pxt run` there. 

## Repos 

The pxt-microbit target depends on several other repos. The main ones are:
- https://github.com/Microsoft/pxt, the PXT framework
- https://github.com/lancaster-university/microbit, basic wrapper around the DAL
- https://github.com/lancaster-university/microbit-dal

## Versions

Current serviced versions of pxt-microbit:

| Target | Version | Type | PXT |
|---|---|---|---|
| pxt-microbit  | v0.13.\* | accessibility | uses pxt/v0 v.0.13.\* (with accessibility) |
| pxt-microbit  | v0.12.\* | release | uses pxt/v0 v.0.12.\* |

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
