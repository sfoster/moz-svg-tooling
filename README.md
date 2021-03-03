SVG optimization & tooling
===========================


Some SVGO plugins and conveniences for optimizing SVGs to prepare them for committing to mozilla-central.

Setup
-----

```
npm install
```


Usage
-----
See `svgo --help` for details on the options it accepts. 
Simplest is to put all the source files you want to optimize in one directory, and indicate an output directory for the optimized result: 

```
./node_modules/svgo/bin/svgo -f ../DeliveredIcons -o ./optimized --config ./icons.config.js 
```

The `icons.config.js` is a custom config which can be used to configure the built-in svgo plugins, add add custom plugins/operations for this set of images. 

