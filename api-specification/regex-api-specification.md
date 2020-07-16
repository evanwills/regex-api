# Regex API Specification

Regex API is intended for use in systems that allow admin users to 
use regular expression for either validation of form inputs or for 
doing complex find and replace work not available in most word 
processors.

> e.g. A system that allows administrators to create web forms uses 
>      regular expressions both the browser side and server side  
>      wants admin to test their validation to ensure the outcome the
>      administrator expects.

The API operates in three modes:

* __`test`__ Which only tests to see if the regular expression is
             valid.
             If not valid it returns a list of all errors found
* __`match`__ Where a regular expresion is validated then applied to
             a set of strings and all the matches are returned to 
             the client (see [Match](#match) below for more detail)
* __`replace`__ Where the regular a list of regular expression valid
             find/replace pairs are applied (in the supplied order)
             valid to all the strings supplied with the request,

## Handling regex errors

When an error is encountered with a given regular expression the 
engine API should take the following steps to provide as much info
about the error as possible:

1. Test the delimiters (if the engine requires delimiters)
   1. If there is a problem with the delimiters, try alternative 
      delimiters to find delimiters that do not have a problem.
2. Test the modifiers (if any are supplied)
   1. If there are bad modifiers, remove them.
3. Validate the regex with known good delimiters and modifiers

### Handling pattern errors

For pattern errors the engine should try to capture the character 
that caused the erorr, and it's position and return that info with 
the error object for that regex
