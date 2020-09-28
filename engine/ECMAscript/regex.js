
/**
 * Constructor for Regex object
 *
 * @param {number}  id             ID of the regex pair
 * @param {string}  find           Regular expression pattern
 * @param {string}  replace        Replace pattern
 * @param {string}  flags          ECMA Script pattern modifiers/flags
 * @param {boolean} convertEscaped
 *
 */
function Regex(id, find, replace, flags, convertEscaped) {
  var _id = 0
  var _find = ''
  var _replace = ''
  var _flags = ''

  var _regex = null
  var _isValid = false
  var _recoverableError = false
  var _errors = {
    pattern: '',
    flags: '',
    delimiters: ''
  }

  /**
   *
   * @param {string} pattern
   *
   * @returns {string}
   */
  function validateFind (pattern) {
    if (typeof pattern !== 'string') {
      throw Error ('Regex constructor requires second parameter "pattern" to be a string. ' + typeof pattern + ' given.')
    }

    try {
      new RegExp(pattern, '')
    } catch (e) {
      _errors.pattern = e
      return false
    }
    return pattern
  }

  /**
   * Strip invlid flags and add warnings for any invalid flags
   *
   * @param {string} flags
   *
   * @returns {string}
   */
  function validateFlags (flags) {
    var _allFlags = ['g', 'i', 'm', 's', 'u', 'y']
    var _output = ''
    var _sep = ''

    if (typeof flags !== 'string') {
      throw Error ('Regex constructor requires fourth parameter "flags" to be a string. ' + typeof flags + ' given.')
    }

    for (a = 0; a < flags.length; a += 1) {
      if (_allFlags.indexOf(flags[a]) > -1) {
        _output += flags[a]
      } else {
        _recoverableError = true
        _errors.flags += _sep + '"' + flags[a] + '" is not a valid RegExp flag'
        _sep = '; '
      }
    }

    return _output
  }

  /**
   * Test if input is a string and if whitespace escape sequences
   * should be converted to their real equivalents
   *
   * @param {string} input
   * @param {boolean} convertEscaped
   *
   * @returns string
   */
  function doConvert (input, convertEscaped) {
    var _convert = (typeof convertEscaped === 'boolean') ? convertEscaped : false
    var _escaped = []
    var _output = ''

    if (typeof input === 'string') {
      _output = input
      if (_convert === true) {
        _escaped = [
          { find: '\\n', replace: '\n' },
          { find: '\\r', replace: '\r' },
          { find: '\\t', replace: '\t' }
        ]
        for (var a = 0; a < _escaped.length; a += 1) {
          _output = _output.replace(new RegExp(_escaped[a].find, 'g'), _escaped[a].replace)
        }
      }
      return _output
    } else {
      throw Error('regexAPIregex() expects fourth parameter to be a string. ' + typeof $input + ' given.')
    }

  }

  // --------------------------------------------
  // START: doing constructor stuff

  if (typeof id !== number) {
    throw Error()
  }

  try {
    _find = validateFind(find)
  } catch (e) {
    console.error(e)
    throw Error(e)
  }

  try {
    _replace = doConvert(replace, convertEscaped)
  } catch (e) {
    console.error(e)
    throw Error(e)
  }

  _flags = validateFlags(flags)

  try {
    _regex = new RegExp(_find, _flags)
  } catch (e) {
    _isValid = false
  }

  //  END:  doing constructor stuff
  // --------------------------------------------

  /**
   * Get the ID of this Regex
   *
   * @return {number}
   */
  this.getID = function () {
    return _id
  }

  /**
   * Get the raw Regular Expression pattern string
   *
   * @returns {string}
   */
  this.getPattern = function () {
    return _find
  }

  /**
   * Get the replacement pattern string
   *
   * @returns {string} Replacement pattern used calls to Regex.replace()
   */
  this.getReplace = function () {
    return _replace
  }

  /**
   * Get the error message strings for this Regex
   * @returns {object}
   */
  this.getErrors = function () {
    return _errors
  }

  /**
   * Get the list of errors for this regex
   *
   * @param {string} prop Name of error type
   *
   * @returns array List of RegexError objects
   */
  this.getError = function () {
    var _output = []

    if (_errors.pattern !== '') {
      _output.push({
        autoRepair: false,
        type: 'pattern',
        message: _errors.pattern,
        badCharacter: '',
        offset: 0,
        rawMessage: _errors.pattern
      })
    }
    if (_errors.flags !== '') {
      _output.push({
        autoRepair: _recoverableError,
        type: 'modifiers',
        message: _errors.flags,
        badCharacter: '',
        offset: 0,
        rawMessage: _errors.flags
      })
    }

    return output
  }

  /**
   * Test if the Regular expression is valid
   *
   * @returns {boolean}
   */
  this.test = function () {
    return _isValid
  }

  /**
   * Get everything matched by this regex from the supplied sample
   *
   * @param {string} sample
   * @returns {Array}
   */
  this.match = function (sample) {
    var _match = []
    var _allMatches = []
    var _whole = ''
    var _captured = []

    if (typeof sample !== 'string') {
      throw Error('Regex.match() expects only parameter "sample" to be a string. ' + typeof sample + ' given')
    };

    while (_match = sample.exec(_regex) !== null) {
      _whole = _match[0]
      _captured = []
      if (_match.length > 1) {
        for (var a = 1; a < _match.length; a += 1) {
          _captured.push(_match[a])
        }
      }

      _allMatches.push({
        whole: _whole,
        parts: _captured
      });
    }
    return _allMatches
  };

  /**
   * Change a
   * @param {string} sample sample string to be modified by the
   *                        regular expression
   *
   * @returns {string} modified version of sample string
   */
  this.replace = function (sample) {
    if (typeof sample !== 'string') {
      throw Error('Regex.replace() expects only parameter "sample" to be a string. ' + typeof sample + ' given')
    }

    return sample.replace(_regex, _replace)
  }
}
