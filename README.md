# blease
Behavioral requirement management and unit-test creation.
This software is meant to glue together requirement-management and continuous integration.  
It supports principles of agile development.  

Blease transforms requirements into Mocha Unit-Tests in BDD - style (that's the name...Behavioral Please).

![List View](https://raw.githubusercontent.com/stephanbruny/blease/master/public/screenshots/list.png)

## Requirement

A requirement is a set of "things" (or checklist) to assemble a feature or other requirement of a software product.  
Requirements can be weighted by complexity.
They can belong to a user-defined category and have a user-defined state.

## Things

Are atomic worksteps or details to be done to fullfill the requirement.
F.e. a thing could be a button on a form with a simple function.
Make sure to define "things" so they can be tested as a single test of a unit-test.

## Effort

A requirements effort is the sum of things and their complexities.

## Categories

Categories are optional.
Requirements can have different qualities, and come in from different departments.

A feature request would be made by the product owner and maybe have the form of a UI-Test.
But a requirement could also come from a developer who needs a certain schema for some data.  
A tester would insert a bug and so on...


# Development

Blease is written in JavaScript based on NodeJS.

## Core

Blease-Core is a simple RPC-Server utilizing EJDB as storage layer.
The core could be seen as the "backend" of Blease. 
It's written in ECMAScript 6th Edition.

## UI

A simple HTML-UI for web browsers.
The Core serves static pages. Communication is done via JSON-RPC.
All pages are built dynamically by plain but modern JavaScript.

Supported Browser IE9+ and all other properly made browsers.


## JSON-RPC-Protocol

To be done...

## Plugins

To be done...
