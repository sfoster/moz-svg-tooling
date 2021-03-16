SVG optimization & tooling
===========================


Some SVGO plugins and conveniences for optimizing SVGs to prepare them for committing to mozilla-central.
These are not general-purpose configs for any/all SVG icons; they are written to work against the specific SVG structure and content for this project's deliverables.

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
./node_modules/svgo/bin/svgo -f ../SourceIcons -o ./optimized --config ./icons.config.js 
```

The `icons.config.js` is a custom config which can be used to configure the built-in svgo plugins, add add custom plugins/operations for this set of images. 


Pre-processing/cropping

```
./node_modules/svgo/bin/svgo -f ../SourceIcons -o ./cropped --config ./crop-icons.config.js 
```

The `crop-icons.config.js` is a custom config which crops 24x24, 20x20 or 16x16 icons down to 20x20, 16x16 and 12x12 respectively. It pretty-formats the SVG, but should make no other changes or optimizations. 
