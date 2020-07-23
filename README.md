# Regex API

Regex API is an API speicification, a web based client, plus a few sample engine implementations.
* Pure EcmaScript (TypeScript RegExp)
* XRegExp (Javascript XRegExp)
* PHP (PCRE)
* DotNet _(coming soon)_

The intention is that the implementations in this repo can be used as a reference to create implementations for other plaforms

Because the API client is written in TypeScript, it comes with a JavaScript implementation of the API using JavaScript's native RegExp functionality. It also comes with a XRegExp implmentation because it was easy once the JavaScritp version was done. Since I have a background in PHP development and extensive experience using PHP's PCRE regex engine, it also comes with a PHP implementation of the API. (The core of which has been battle tested for a number of years).

## Purpose

As part of my daily work as a developer, working for a university, I end up doing lots of stuff that's made easier if I use regular expressions so this is primarily to make my life easier with that work.

It's also intended that this can be used as part of systems that allow users to create regexes when creating "things". e.g. If you have a system that builds web forms and allows form creators to set up field validation, then you could use this to ensure that the validation doesn't cause errors and that it is testing the right things (i.e. no false positives and no false negatives).

## What it doesn't do

It is assumed that any authentication with back end servers is managed outside this module.

## What it does do

It provides a modern API client (written in TypeScript using LitHTML) plus various Engine implementations.

It only does work with regular expressions and strings the regualar expressions are to be applied to.

You give it one (or more) pieces text and one (or more) regular expressions and it either:
* test the regex to see if it's valid, 
* applies all the supplied regexs to every supplied string to find any matches or 
* transforms the string(s) by applying the regex(s) (in series) to the string and returning the result.


This repo contains three implementations:

In the future it may contain a DotNet implementation 
