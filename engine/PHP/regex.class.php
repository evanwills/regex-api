<?php

/**
 * This file contains a class for handling requests to the PHP
 * implementation of Regex API
 *
 * PHP VERSION: ^7.4
 *
 * @category RegexAPI
 * @package  RegexAPI
 * @author   Evan Wills <evan.wills@gmail.com>
 * @license  MIT <url>
 * @link     https://github.com/regex-api
 */

/**
 * Handle doing preg stuff for a single regular expression
 *
 * @category RegexAPI
 * @package  RegexAPI
 * @author   Evan Wills <evan.wills@gmail.com>
 * @license  MIT <url>
 * @link     https://github.com/regex-api
 */
class Regex
{
    /**
     * Maximum number of characters a pattern, replacement, whole
     * match & sub-pattern match can be.
     *
     * @var integer
     */
    const HARD_MAX = 2048;

    /**
     * When no delimiters are supplied this will be used as the
     * default delimiter
     *
     * @var string
     */
    static private $_defaultDelimiter = '`';

    /**
     * Maximum number of characters for the whole match
     *
     * @var integer
     */
    static private $_maxWhole = 300;

    /**
     * Maximum number of characters for the matched sub-patterns
     *
     * @var integer
     */
    static private $_maxPart = 300;

    static private $_allowedModifiers = array(
        'i', 'm', 's', 'x',
        'A', 'D', 'S', 'U', 'X', 'J', 'u'
    );

    static private $_allowedDelimiters = array(
        '`', '/', '#', '~', ';', '%', '+', '!', '@', '$',
        '^', '&', '*', '|', ':', '\'', '"', ',', '.', '?'
    );
    static private $_allowedPairedDelimiters = array(
        array('open' => '(', 'close' => ')'),
        array('open' => '{', 'close' => '}'),
        array('open' => '[', 'close' => ']'),
        array('open' => '<', 'close' => '>')
    );

    /**
     * The ID of the regex (as supplied in the request)
     *
     * @var integer
     */
    private $_id = 0;

    /**
     * Regular expression (without delimiters or modifiers)
     *
     * @var string
     */
    private $_pattern = '';

    /**
     * Opening and closing delimiters for regular expression
     *
     * @var string[]
     */
    private $_delimiters = array(
        'open' => '',
        'close' => ''
    );

    /**
     * PCRE modifier characters
     *
     * @var string
     */
    private $_modifiers = '';

    /**
     * Replacement pattern/string to apply to text
     *
     * @var string
     */
    private $_replace = '';

    /**
     * Error messages for various parts of regex
     *
     * @var string[]
     */
    private $_errors = array(
        'pattern' => '',
        'delimiters' => '',
        'modifiers' => ''
    );

    /**
     * Raw error message generated by PCRE
     *
     * @var string
     */
    private $_rawError = '';

    /**
     * Whether or not the supplied regular expression was valid
     *
     * @var boolean
     */
    private $_isValid = true;

    private $_regex = '';

    /**
     * Constructor for Regex objects
     *
     * @param integer $id             ID for the regex
     * @param string  $find           Regular expression pattern
     *                                (without delimters & modifiers)
     * @param string  $replace        Replacement string/pattern
     * @param array   $delimiters     Opening and closing delimiters
     * @param string  $modifiers      PCRE pattern modifiers
     * @param boolean $convertEscaped whether or not to find escaped
     *                                white space characters and
     *                                change them to their normal
     *                                whitespace characters
     */
    public function __construct(
        int $id,
        string $find,
        string $replace,
        array $delimiters,
        string $modifiers,
        bool $convertEscaped
    ) {
        if (!$this->_validateDelimiters($delimiters)) {
            $this->_isValid = false;
        }
        if (!$this->_validateModifiers($modifiers)) {
            $this->_isValid = false;
        }

        if (strlen($find) > self::HARD_MAX || strlen($find) < 1) {
            throw new Exception(
                'Regex constructor expects first parameter $find '.
                'to be an string with between 1 & '.self::HARD_MAX.
                ' characters. '.strlen($find).' characters given.'
            );
        }

        $regex = $this->_delimiters['open'].
                $find.
                $this->_delimiters['close'].
                $this->_modifiers;

        $tmp = $this->_validateRegex($regex);
        if ($tmp !== '') {
            $this->_isValid = false;
            $this->_errors['pattern'] = $tmp;
        } else {
            $this->_pattern = $find;
            $this->_regex = $regex;
        }

        if (strlen($replace) > self::HARD_MAX) {
            throw new Exception(
                'Regex constructor expects second parameter $replace '.
                'to be a string with between 0 & '.self::HARD_MAX.
                ' characters. '.strlen($replace).' characters given.'
            );
        }

        $this->_replace = ($convertEscaped === true) ?
            $this->_unescapeWhiteSpace($replace) :
            $replace;
    }

    /**
     * Get whether this regular expression is valid
     *
     * @return boolean
     */
    public function isValid()
    {
        return $this->_isValid;
    }

    /**
     * Get all the error information for this regex
     *
     * @return array
     */
    public function getError()
    {
        $tmp = array();
        if ($this->_isValid === false) {
            $tmp = array(
                'badCharacter' => '',
                'delimiterError' => $this->_errors['delimiters'],
                'modifierError' => $this->_errors['modifiers'],
                'offset' => -1,
                'patternError' => $this->_errors['pattern'],
                'rawMessage' => ''
            );
        }
        return array(
            'id' => $this->_id,
            'isValid' => $this->_isValid,
            'error' => $tmp
        );

    }

    /**
     * Get everything matched by this regular expression for supplied
     * string
     *
     * @param string $input String to be tested
     *
     * @return array
     */
    public function match(string $input)
    {
        if (!is_string($input) && !is_numeric($input)) {
            throw new Exception(
                'Regex::Match() expects only input to be either text or numeric. '.
                gettype($input).' given.'
            );
        }
        $output = array(
            'matches' => array(),
            'duration' => 0
        );
        if ($this->_isValid === false) {
            return $output;
        }

        $start = microtime(true);

        if (preg_match_all($input, $this->_regex, $matches, PREG_SET_ORDER)) {
            $output['duration'] = (microtime(true) - $start);

            for ($a = 0; $a < count($matches); $a += 1) {
                $tmp = array(
                    'whole' => $this->_truncateWhole(array_shift($matches[$a])),
                    'parts' => $matches[$a]
                );
                foreach ($tmp['parts'] as $key => $value) {
                    $tmp['parts'][$key] = $this->_truncatePart($value);
                }
                $output['matches'][] = $tmp;
            }
        } else {
            $output['duration'] = (microtime(true) - $start);
        }

        return $output;
    }


    /**
     * Transform supplied string using this regular expression
     *
     * @param string $input String to be transformed
     *
     * @return array
     */
    public function replace(string $input)
    {
        if (!is_string($input) && !is_numeric($input)) {
            throw new Exception(
                'Regex::Match() expects only input to be either text or numeric. '.
                gettype($input).' given.'
            );
        }
        if ($this->_isValid === false) {
            return $input;
        }

        $start = microtime(true);
        return array(
            'sample' => preg_replace($this->_regex, $this->_replace, $input),
            'duration' => (microtime(true) - $start)
        );
    }

    /**
     * Set the maximum length of the whole match
     *
     * @param integer $input Maximum number of characters whole match
     *                       can be before being truncated
     *
     * @return boolean
     */
    static public function setMaxWhole(int $input)
    {
        if ($input < 10 || $input > self::HARD_MAX) {
            throw new Exception(
                'Regex::setMaxWhole() expects only parameter to be an integer '.
                'greater than 10 and less than '.self::HARD_MAX.'. '.$input.' given.'
            );
        }
        self::$_maxWhole = $input;
    }

    /**
     * Set the maximum length of the sub-pattern match
     *
     * @param integer $input Maximum number of characters subpattern
     *                       match can be before being truncated
     *
     * @return boolean
     */
    static public function setMaxPart(int $input)
    {
        if ($input < 10 || $input > self::HARD_MAX) {
            throw new Exception(
                'Regex::setMaxPart() expects only parameter to be an integer '.
                'greater than 10 and less than '.self::HARD_MAX.'. '.$input.' given.'
            );
        }

        self::$_maxPart = $input;
    }

    /**
     * Get the maximum length of the whole match
     *
     * @return integer
     */
    static public function getMaxWhole()
    {
        return self::$_maxWhole;
    }

    /**
     * Get the maximum length of the sub-pattern match
     *
     * @return integer
     */
    static public function getMaxPart()
    {
        return self::$_maxPart;
    }

    /**
     * Set the modifiers allowed by this server
     * 
     * Allowes the server/API admin to reduce the allowed modifiers 
     * to whatever they feel is appropriate
     * 
     * NOTE: Invalid modifiers will be silently ignored
     *
     * @param string $modifiers PCRE modifiers allowed by this server
     * 
     * @return array the final list of modifiers
     */
    static public function setAllowedModifiers(string $modifiers)
    {
        $allowedModifiers = array(
            'i', 'm', 's', 'x',
            'A', 'D', 'S', 'U', 'X', 'J', 'u'
        );
        $_modifiers = str_split($modifiers);
        $output = array();
        for ($a = 0; $a < count($modifiers); $a += 1) {
            if (in_array($_modifiers[$a], $allowedModifiers) 
                && !in_array($_modifiers[$a], $output)
            ) {
                    $output[] = $_modifiers[$a];
            }
        }
        self::$_allowedModifiers = $output;
        return $output;
    }

    /**
     * Get the modifiers allowed by this server/API
     *
     * @return array
     */
    static public function getAllowedModifiers()
    {
        return self::$_allowedModifiers;
    }

    /**
     * Set the delimiters this server/API will accept as PCRE delimiters
     *
     * NOTE: Invalid delimiters will be silently ignored
     * 
     * @param string $delimiters Characters this server/API accepts 
     *                           as PCRE delimiters
     * 
     * @return array,false FALSE if no valid delimiters were provided
     */
    static public function setAllowedDelimiters(string $delimiters)
    {
        $allowedDelimiters = array(
            '`', '/', '#', '~', ';', '%', '+', '!', '@', '$',
            '^', '&', '*', '|', ':', '\'', '"', ',', '.', '?'
        );
        $allowedPairedDelimiters = array(
            '(' => array('open' => '(', 'close' => ')'),
            ')' => array('open' => '(', 'close' => ')'),
            '{' => array('open' => '{', 'close' => '}'),
            '}' => array('open' => '{', 'close' => '}'),
            '[' => array('open' => '[', 'close' => ']'),
            ']' => array('open' => '[', 'close' => ']'),
            '<' => array('open' => '<', 'close' => '>'),
            '>' => array('open' => '<', 'close' => '>')
        );
        $_delimiters = str_split($delimiters);

        $outputD = array();
        $outputP = array();
        $tmp = array();
        
        for ($a = 0; $a < count($_delimiters); $a += 1) {
            $delim = $_delimiters[$a];
            if (in_array($delim, $allowedDelimiters)
                && !in_array($delim, $outputD)
            ) {
                $outputD[] = $delim;
            } elseif (array_key_exists($delim, $allowedPairedDelimiters)
                && !in_array($delim, $tmp)
            ) {
                $tmp[] = $allowedPairedDelimiters[$delim]['open'];
                $tmp[] = $allowedPairedDelimiters[$delim]['close'];
                $outputP[] = $allowedPairedDelimiters[$delim];
            }
        }
        
        if (empty($outputD) && empty($outputP)) {
            return false;
        } else {
            self::$_allowedPairedDelimiters = $outputP;
            self::$_allowedDelimiters = $outputD;

            return array(
                'single' => self::$_allowedDelimiters, 
                'paired' => self::$_allowedPairedDelimiters
            );
        }
    }

    /**
     * Get lists of single and paired delimiters allowed by this 
     * server/API
     *
     * @return array
     */
    static public function getAllowedDelimiters()
    {
        return array(
            'single' => self::$_allowedDelimiters, 
            'paired' => self::$_allowedPairedDelimiters
        );
    }

    /**
     * Ensure that a string is no longer than it should be.
     *
     * @param string $input String to be truncated
     *
     * @return string
     */
    private function _truncateWhole(string $input)
    {
        if (strlen($input) > self::$_maxWhole) {
            return substr($input, 0, self::$_maxWhole);
        }
        return $input;
    }

    /**
     * Ensure that a string is no longer than it should be.
     *
     * @param string $input String to be truncated
     *
     * @return string
     */
    private function _truncatePart(string $input)
    {
        if (strlen($input) > self::$_maxPart) {
            return substr($input, 0, self::$_maxPart);
        }
        return $input;
    }

    /**
     * Test whether the supplied regular expression is valid
     *
     * @param string $input Regular expression to be validated
     *
     * @return string
     */
    private function _validateRegex(string $input)
    {
        if ($old_track_errors = ini_get('track_errors')) {
            $old_php_errormsg = isset($php_errormsg) ? $php_errormsg : false;
        } else {
            ini_set('track_errors', 1);
        }

        unset($php_errormsg);

        @preg_match($input, '');

        $output = isset($php_errormsg) ? $php_errormsg : '';

        if ($old_track_errors) {
            $php_errormsg = isset($old_php_errormsg) ? $old_php_errormsg : false;
        } else {
            ini_set('track_errors', 0);
        }

        return $output;
    }

    /**
     * Test whether supplied delimiters are valid
     *
     * @param array $delimiters PCRE opening and closing delimiters
     *
     * @return boolean
     */
    private function _validateDelimiters(array $delimiters)
    {
        if (!array_key_exists('open', $delimiters)) {
            throw new Exception(
                'Regex constructor expects third parameter $delimter '.
                'to be an array with both an "open" and "close" key. '.
                '"open" key is missing.'
            );
        } elseif (!is_string($delimiters['open'])
            || strlen($delimiters['open']) !== 1
        ) {
            throw new Exception(
                'Regex constructor expects third parameter $delimter '.
                'to be an array with both an "open" and "close" key. '.
                'Both containing only one non-alphanumeric character. '.
                '"open" is neither a string nor a single character.'
            );
        } elseif (!array_key_exists('close', $delimiters)) {
            throw new Exception(
                'Regex constructor expects third parameter $delimter '.
                'to be an array with both an "open" and "close" key. '.
                '"close" key is missing.'
            );
        } elseif (!is_string($delimiters['close'])
            || strlen($delimiters['close']) !== 1
        ) {
            throw new Exception(
                'Regex constructor expects third parameter $delimter '.
                'to be an array with both an "open" and "close" key. '.
                'Both containing only one non-alphanumeric character. '.
                '"close" is neither a string nor a single character.'
            );
        } elseif (!$this->_delimiterIsAllowed($delimiters['open'])) {
            throw new Exception(
                'Regex constructor expects third parameter $delimter '.
                'to be an array with both an "open" and "close" key. '.
                'Both containing only one non-alphanumeric character '.
                'allowed by this server/API. "open" does not match '.
                'any of the allowed delimiters for this server/API. '.
                'Allowed delimiters are: '.
                $this->_getAllowedDelimitersForError()
            );
        } elseif (!$this->_delimiterIsAllowed($delimiters['close'])) {
            throw new Exception(
                'Regex constructor expects third parameter $delimter '.
                'to be an array with both an "open" and "close" key. '.
                'Both containing only one non-alphanumeric character '.
                'allowed by this server/API. "close" does not match '.
                'any of the allowed delimiters for this server/API. '.
                'Allowed delimiters are: '.
                $this->_getAllowedDelimitersForError()
            );
        }

        $this->_delimiters['open'] = $delimiters['open'];
        $this->_delimiters['close'] = $delimiters['close'];

        $tmp = $this->_validateRegex(
            $this->_delimiters['open'].'.*'.
            $this->_delimiters['close']
        );
        if ($tmp !== '') {
            $this->_errors['delimiters'] = $tmp;
            $this->_delimiters['open'] = self::$_defaultDelimiter;
            $this->_delimiters['close'] = self::$_defaultDelimiter;
            return false;
        } else {
            return true;
        }
    }
    /**
     * Validate supplied PCRE pattern modifiers
     *
     * @param string $input PCRE pattern modifiers
     *
     * @return boolean
     */
    private function _validateModifiers(string $input)
    {
        $output = true;

        $input = str_split($input);

        $allowedModifiers = array(
            'i', 'm', 's', 'x',
            'A', 'D', 'S', 'U', 'X', 'J', 'u'
        );

        $this->_modifiers = '';
        $sep = '';
        for ($a = 0; $a < count($input); $a += 1) {
            if (substr_count($this->_modifiers, $input[$a]) === 0) {
                if (in_array($input[$a], self::$_allowedModifiers)) {
                    $this->_modifiers .= $input[$a];
                } else {
                    $output = false;

                    if (!in_array($input[$a], $allowedModifiers)) {
                        $this->_errors['modifiers'] .= $sep.'"'.$input[$a].
                            '" is not a valid PCRE modifier.';
                    } else {
                        $this->_errors['modifiers'] .= $sep.'"'.$input[$a].
                            '" is not allowed by this server/API.';
                    }
                    
                    $sep = '; ';
                }
            } else {
                $output = false;
                $this->_errors['modifiers'] .= $sep.'"'.$input[$a].
                    '" is a duplicate of a previous modifier;';
                $sep = '; ';
            }
        }
        return $output;
    }

    /**
     * Convert white space escape sequences to normal white space
     * characters
     *
     * @param string $input Replacement pattern with white space
     *                      escape sequences
     *
     * @return string
     */
    private function _unescapeWhiteSpace(string $input)
    {
        $find = array(
            '\t', '\n', '\r'
        );
        $replace = array(
            "\t", "\n", "\r"
        );
        return str_replace($find, $replace, $input);
    }

    /**
     * Extract usable information for PHP PCRE regex syntax error
     * generated by a bad regular expression
     *
     * @param string $input Regex error message.
     *
     * @return string
     */
    private function _parsePCREerrorMessage($input)
    {
        $output = $input;

        return $output;
    }

    /**
     * Test whether a given delimiter is allowed by this server/API
     *
     * @param string $delim Delimiter charachter for PCRE regex
     * 
     * @return boolean
     */
    private function _delimiterIsAllowed($delim)
    {
        if (in_array($delim, self::$_allowedDelimiters)) {
            return true;
        } else {
            for ($a = 0; $a < count(self::$_allowedPairedDelimiters); $a += 1) {
                if (in_array($delim, self::$_allowedPairedDelimiters[$a])) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Get all the allowed delimiters as a quoted, comma separated string
     *
     * @return string
     */
    private function _getAllowedDelimitersForError()
    {
        $output = '';
        $sep = '';
        for ($a = 0; $a < count(self::$_allowedDelimiters); $a += 1) {
            $delim = self::$_allowedDelimiters[$a];

            $delim = ($delim === '"') ? "'$delim'" : '"'.$delim.'"';
            $output = $sep.$delim;
            $sep = ', ';
        }
        for ($a = 0; $a < count(self::$_allowedPairedDelimiters); $a += 1) {
            $output = $sep.self::$_allowedPairedDelimiters[$a];
            $sep = ', ';
        }
        return $output;
    }
}
