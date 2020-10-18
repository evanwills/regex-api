# IRegex API Specification

Regex API is intended for use in systems that allow admin users to 
use regular expression for either validation of form inputs or for 
doing complex find and replace work not available in most word 
processors.

> e.g. A system that allows administrators to create web forms uses 
>      regular expressions both the browser side and server side  
>      wants admin to test their validation to ensure the outcome the
>      administrator expects.

The API operates in four modes:

* __`test`__ Which only tests to see if the regular expression is
             valid.
             If not valid it returns a list of all errors found
* __`match`__ Where a regular expresion is validated then applied to
             a set of strings and all the matches are returned to 
             the client (see [Match](#match) below for more detail)
* __`replace`__ Where the regular a list of regular expression valid
             find/replace pairs are applied (in the supplied order)
             valid to all the strings supplied with the request
* __`getConfig`__ Get config defaults for engine (to help with client 
             side validation applied before sending the regex to the 
             server/API)

## Handling regex errors

When an error is encountered with a given regular expression the 
engine API should take the following steps to provide as much info
about the error as possible:

1. Test the delimiters (if the engine requires delimiters)
   1. If there is a problem with the delimiters, try alternative 
      delimiters to find delimiters that do not have a problem.
   2. Send alternitive recommended delimiter as part of the error
      message
2. Test the modifiers (if any are supplied)
   1. If there are bad modifiers, remove them.
   2. Report which modifiers wer bad as part of error message
3. Validate the regex with known good delimiters and modifiers
4. Even if it's possible after finding alternative delimiters and
   removing bad modifiers, skip running match/replace actions on 
   regex with errors

### Handling pattern errors

For pattern errors the engine should try to capture the character 
that caused the erorr, and it's position and return that info with 
the error object for that regex


## Multiple regexes

There are many times when using a single large all purpose regex on 
a string is more error prone than using multiple, small, single purpose 
regexes. IRegex API assumes that when it is supplied with multiple 
regexes, the regexes are to be run in series ("Chained").

It is also understood that there are good reasons why "chaining" 
might be undesirable. Therefore, it is possible to toggle "chaining"
on and off with each request. 

__NOTE:___ If the chaining property isn't supplied with a request, 
           it is assumed that chaining will be turned on.

## Returning match results

Match results must be returned grouped by sample (when multiple 
samples are supplied). Then grouped by regexes (when multiple regexes 
are supplied)


## Handling abusive requests

As soon as an engine encounters a request that breaches any one of 
it's advertised limits it should stop processing and return an error.
