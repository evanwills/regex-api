<?php

/**
 * This file contains a class for handling requests to the PHP
 * implementation of Regex API
 *
 * PHP VERSION: ^7.4
 *
 * @category RegexAPI
 * @package  RegexAPI
 * @author   Evan Wills <evan.i.wills@gmail.com>
 * @license  MIT <url>
 * @link     https://github.com/regex-api
 */


if (!defined('REGEX_CLASS')) {
    require_once __DIR__.'/regex.class.php';
}
if (!defined('REGEX_API_CONFIG')) {
    require_once __DIR__.'/regex-api-config.class.php';
}

/**
 * Handle user supplied request data
 *
 * @category RegexAPI
 * @package  RegexAPI
 * @author   Evan Wills <evan.wills@gmail.com>
 * @license  MIT <url>
 * @link     https://github.com/regex-api
 */
class RegexAPI
{
    // ==========================================
    // START: Object properties

    private $_config = null;

    /**
     * List of regex objects for testing or transforming samples
     *
     * @var array
     */
    private $_regexes = array();

    /**
     * List of sample strings to be searched or transformed
     *
     * @var array
     */
    private $_samples = array();

    /**
     * Undocumented variable
     *
     * @var string
     */
    private $_mode = '';

    /**
     * List of valid modes for the API
     *
     * @param string $json
     */
    private $_modes = array(
        'test',
        'match',
        'replace'
    );

    /**
     * Whether or not to do find and replace on sample before running
     * the previous regular expression
     *
     * @var boolean
     */
    private $_chainRegexes = true;

    /**
     * Status code for this object (zero means no errors)
     *
     * @var integer
     */
    private $_errorCode = 0;

    /**
     * Human readable error message to return with response.
     * (Only applies to request as a whole, not individual regular
     *  expressions.)
     *
     * @var string
     */
    private $_errorMessage = '';


    //  END:  Object properties
    // ==========================================
    // START: Constructor


    /**
     * RegexAPI constructor
     *
     * @param string         $json   JSON received from $_GET or
     *                               $_POST request
     * @param RegexAPIconfig $config Config settings for the API
     */
    public function __construct(string $json, RegexAPIconfig $config)
    {
        $this->_config = $config;
        $json = trim($json);

        $maxRequestLen = $config->get('limitMaxLengthTotalRequest');

        if ($json === '') {
            $this->_errorCode = 201;
            $this->_errorMessage = 'JSON cannot be an empty string';
            return;
        } elseif ($maxRequestLen > 0 && strlen($json) > $maxRequestLen) {
            $this->_errorCode = 202;
            $this->_errorMessage = 'JSON length exceded the maximum '.
                'number of characters ('.$maxRequestLen.'). '.
                'Received: '.strlen($json);
            return;
        }
        unset($maxRequestLen);

        try {
            $data = json_decode($json, true);
        } catch (Exception $e) {
            $this->_errorCode = 203;
            $this->_errorMessage = 'Invalid JSON: '.$e->getMessage();
            return;
        }
        unset($json);

        if ($this->_validateType($data)) {
            if ($this->_validateAllRegexes($data)) {
                $this->_validateAllSamples($data);
            }
        }
    }


    //  END:  Constructor
    // ==========================================
    // START: public API methods


    /**
     * Process regular expressions and strings
     *
     * @return string
     */
    public function getResponseJSON()
    {
        $output = array(
            'ok' => ($this->_errorCode === 0),
            'code' => $this->_errorCode,
            'content' => array(''),
            'message' => $this->_errorMessage,
            'hasTiming' => ($this->_errorCode === 0 && $this->_mode !== 'test')
        );
        if ($this->_errorCode === 0) {
            $func = $this->_mode;
            $output['content'] = $this->$func();
        }

        return json_encode($output);
    }

    /**
     * Test all regular expressions
     *
     * @return array
     */
    public function test()
    {
        $output = array();
        for ($b = 0; $b < count($this->_regexes); $b += 1) {
            $output[] = $this->_regexes[$b]->getError();
        }
        return $output;
    }

    /**
     * Apply all regular expressions to all strings
     *
     * @return array
     */
    public function match()
    {
        $output = array();

        $regexC = count($this->_regexes);
        for ($a = 0; $a < count($this->_samples); $a += 1) {
            $sample = $this->_samples[$a];
            $tmp1 = array(
                'sample' => $this->_truncateSample($sample),
                'regexes' => array()
            );
            for ($b = 0; $b < $regexC; $b += 1) {
                $regex = $this->_regexes[$b];

                $tmp2 = array(
                    'regex' => $regex->getError(),
                    'matches' => array(),
                    'duration' => 0
                );

                if ($regex->isValid() === true) {
                    $tmp = $regex->match($sample);
                    $tmp2 = array_merge($tmp2, $tmp);

                    unset($tmp);

                    if ($this->_chainRegexes === true && $b < $regexC - 1) {
                        // This is not the last regex in the list
                        // So we'll apply the find and replace
                        $sample = $regex->replace($sample);
                    }
                }
                $tmp1['regexes'][] = $tmp2;
                unset($regex, $tmp2);
            }
            $output[] = $tmp1;
            unset($tmp1);
        }

        return $output;
    }

    /**
     * Test all regular expressions
     *
     * @return array
     */
    public function replace()
    {
        $output = array();

        for ($a = 0; $a < count($this->_samples); $a += 1) {
            $sample = $this->_samples[$a];
            $duration = 0;
            for ($b = 0; $b < count($this->_regexes); $b += 1) {
                if ($this->_regexes[$b]->isValid() === true) {
                    $tmp = $this->_regexes[$b]->replace($sample);
                    $sample = $tmp['sample'];
                    $duration += $tmp['duration'];
                }
            }
            $ouput[] = array(
                'sample' => $sample,
                'duration' => $duration
            );
        }

        return $output;
    }

    //  END:  public API methods
    // ==========================================
    // START: public (static) config methods


    /**
     * Get basic config info about this regex engine
     *
     * @return array
     */
    public function getConfig()
    {
        return json_encode($this->_config->getConfig());
    }

    //  END:  public (static) config methods
    // ==========================================
    // START: private static config helper methods

    /**
     * Test whether a given character is valid to use as either a
     * line end character or a split character
     *
     * @param string $char Character to be tested
     * @param string $key  Name of the property being tested
     *
     * @return boolean
     */
    static private function _invalidateChar($char, $key)
    {
        $len = strlen($char);

        if ($len > 4 || $len <= 0) {
            // A minimum of 1 character and maximum of four
            // characters is allowed
            return false;
        } elseif ($key === 'normaliseLineEnd') {
            $ends = array('n', 'r', 'R', 'f');
            $chars = str_split($char, 2);

            for ($a = 0; $a < count($chars); $a += 1) {
                if (strlen($chars[$a]) !== 2) {
                    return false;
                }

                if (substr($chars[$a], 0, 1) !== '\\'
                    || !in_array(substr($chars[$a], 1, 1), $ends)
                ) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Does the actual work of setting API UI defaults
     *
     * @param array        $newDefaults         Array of default values to be
     *                                          set
     * @param string,false $parentKey           Key from parent array
     * @param string,false $grandParentKey      Key from grand parent array
     * @param string,false $greatGrandParentKey Key from great grand parent array
     *
     * @return array,true
     */
    static private function _setDefaultsMulti(
        $newDefaults,
        $parentKey = false,
        $grandParentKey = false,
        $greatGrandParentKey = false
    ) {
        $output = array();
        $args = array();

        if ($parentKey !== false) {
            $args[] = $parentKey;
            if ($grandParentKey !== false) {
                $args[] = $grandParentKey;
                if ($greatGrandParentKey !== false) {
                    $args[] = $greatGrandParentKey;
                }
            }
        }

        foreach ($newDefaults as $key => $value) {
            $tmp = array_merge(
                array($value),
                array($key), // will become parent key
                $args
            );

            if (!is_array($value)) {
                try {
                    call_user_func_array(
                        'self::setDefault',
                        $tmp
                    );
                } catch (Exception $e) {
                    $output[] = $e->getMessage();
                }
            } else {
                $output = array_merge(
                    $output,
                    call_user_func_array(
                        'self::_setDefaultsMulti',
                        $tmp
                    )
                );
            }
        }

        return $output;
    }

    /**
     * Test if two values are the same type.
     *
     * @param string,integer,boolean $val1 First value to be compared
     * @param string,integer,boolean $val2 Second value to be compared
     *
     * @return string Empty if both values are the same type.
     *                Error message otherwise.
     */
    static private function _isSameType($val1, $val2)
    {
        if (gettype($val1) === gettype($val2)) {
            return '';
        } else {
            return 'New default value is invalid. Expecting '.
                gettype($val1). ' found '.
                gettype($val2);
        }
    }

    /**
     * Ensure that the input is no longer than the allowed length
     *
     * @param string $input String to be truncated
     *
     * @return string
     */
    private function _truncateSample($input)
    {
        if (strlen($input) > $this->_maxReturnSampleLength) {
            return substr($input, 0, $this->_maxReturnSampleLength);
        } else {
            return $input;
        }
    }

    /**
     * Validate regex (test) object from JSON
     *
     * @param array $data Regex object from JSON
     *
     * @return Regex,false Regex object or false if $data had issues
     */
    private function _validateTestRegex(array $data)
    {
        $fields = array('id', 'pattern', 'modifiers', 'delimiters');
        for ($a = 0; $a < count($fields); $a += 1) {
            $key = $fields[$a];
            if (!in_array($key, $data)) {
                $this->_errorCode = 200 + $a;
                $this->_errorMessage = 'Regex is missing "'.$key.'" field';
                return false;
            }
        }

        try {
            $output = new Regex(
                $data['id'],
                $data['pattern'],
                '',
                $data['modifiers'],
                $data['delimiters'],
                false
            );
        } catch (Exception $e) {
            $this->_errorCode = 210;
            $this->_errorMessage = 'Regex data contains errors: "'.
                $this->_cleanRegexException($e->getMessage()).'"';
            return false;
        }

        return $output;
    }

    /**
     * Validate regex (replace) object from JSON
     *
     * @param array $data Regex object from JSON
     *
     * @return Regex,false Regex object or false if $data had issues
     */
    private function _validateReplaceRegex(array $data)
    {
        $fields = array(
            'id', 'pattern', 'modifiers', 'delimiters',
            'replace', 'transformWhiteSpace'
        );
        for ($a = 0; $a < count($fields); $a += 1) {
            $key = $fields[$a];
            if (!in_array($key, $data)) {
                $this->_errorCode = 200 + $a;
                $this->_errorMessage = 'Regex is missing "'.$key.'" field';
                return false;
            }
        }

        try {
            $output = new Regex(
                $data['id'],
                $data['pattern'],
                $data['replace'],
                $data['modifiers'],
                $data['delimiters'],
                $data['transformWhiteSpace']
            );
        } catch (Exception $e) {
            $this->_errorCode = 210;
            $this->_errorMessage = 'Regex data contains errors: "'.
                $this->_cleanRegexException($e->getMessage()).'"';
            return false;
        }

        return $output;
    }

    /**
     * Make Regex constructor exception relevant to RegexAPI context
     *
     * @param string $input Error message string from Exception
     *                      thrown by Regex constructor
     *
     * @return string
     */
    private function _cleanRegexException($input)
    {
        return preg_replace(
            '`(?<=Regex )constructor expects [a-z]+ parameter $([^\s]+)`i',
            'property `\1`',
            $input
        );
    }

    /**
     * Validate the Match config values from JSON
     *
     * @param array $data JSON data as associative array
     *
     * @return boolean TRUE if data was all valid, FALSE otherwise
     */
    private function _validateMatchConfig($data)
    {
        if (!array_key_exists('matchConfig', $data)) {
            $this->_errorCode = 140;
            $this->_errorMessage = 'Request data is missing the '.
                'matchConfig field';
            return false;
        } elseif (!is_array($data['matchConfig'])) {
            $this->_errorCode = 141;
            $this->_errorMessage = 'Request data.matchConfig is '.
                'invalid. Expecting array. Found '.
                gettype($data['matchConfig']).'.';
            return false;
        } else {
            $config = $data['matchConfig'];
            if (!array_key_exists('maxSubMatchLen', $config)) {
                $this->_errorCode = 142;
                $this->_errorMessage = 'Request data.matchConfig is '.
                    'missing the maxSubMatchLen field.';
                return false;
            } elseif (!is_int($config['maxWholeMatchLen'])) {
                $this->_errorCode = 143;
                $this->_errorMessage = 'Request data.matchConfig.maxWholeMatchLen '.
                    'must be an integer between 10 & '.Regex::HARD_MAX.'. '.
                    gettype($config['maxWholeMatchLen']).' given.';
                return false;
            } elseif ($config['maxWholeMatchLen'] < 10
                || $config['maxWholeMatchLen'] > Regex::getMaxWhole()
            ) {
                $this->_errorCode = 144;
                $this->_errorMessage = 'Request data.matchConfig.maxWholeMatchLen '.
                    'must be an integer between 10 & '.Regex::getMaxWhole().'. '.
                    gettype($config['maxWholeMatchLen']).' given.';
                return false;
            } else {
                Regex::setMaxWhole($config['maxSubMatchLen']);
            }

            if (!array_key_exists('maxSubMatchLen', $config)) {
                $this->_errorCode = 145;
                $this->_errorMessage = 'Request data.matchConfig is '.
                    'missing the maxSubMatchLen field.';
                return false;
            } elseif (!is_int($config['maxSubMatchLen'])) {
                $this->_errorCode = 146;
                $this->_errorMessage = 'Request data.matchConfig.maxSubMatchLen '.
                    'must be an integer between 10 & '.Regex::getMaxWhole().'. '.
                    gettype($config['maxSubMatchLen']).' given.';
                return false;
            } elseif ($config['maxSubMatchLen'] < 10
                || $config['maxSubMatchLen'] > Regex::getMaxWhole()
            ) {
                $this->_errorCode = 147;
                $this->_errorMessage = 'Request data.matchConfig.maxSubMatchLen '.
                    'must be an integer between 10 & '.Regex::getMaxCaptured().'. '.
                    gettype($config['maxSubMatchLen']).' given.';
                return false;
            } else {
                Regex::setMaxCaptured($config['maxSubMatchLen']);
            }

            if (!array_key_exists('maxReturnSampleLen', $config)) {
                $this->_errorCode = 145;
                $this->_errorMessage = 'Request data.matchConfig is '.
                    'missing the maxReturnSampleLen field.';
                return false;
            } elseif (!is_int($config['maxReturnSampleLen'])) {
                $this->_errorCode = 146;
                $this->_errorMessage = 'Request data.matchConfig.'.
                    'maxReturnSampleLen must be an integer between '.
                    '10 & '.Regex::getMaxWhole().'. '.
                    gettype($config['maxReturnSampleLen']).' given.';
                return false;
            } elseif ($config['maxReturnSampleLen'] < 10
                || $config['maxReturnSampleLen'] > Regex::getMaxWhole()
            ) {
                $this->_errorCode = 147;
                $this->_errorMessage = 'Request data.matchConfig.'.
                    'maxReturnSampleLen must be an integer between '.
                    '10 & '.Regex::getMaxCaptured().'. '.
                    gettype($config['maxReturnSampleLen']).' given.';
                return false;
            } else {
                $this->__maxReturnSampleLength = $config['maxReturnSampleLen'];
            }
        }
        return true;
    }

    /**
     * Test and import Regex part of request
     *
     * @param array $data Associative array from from parsed JSON data
     *
     * @return boolean TRUE if regex data was valid FALSE otherwise
     */
    private function _validateAllRegexes(array $data)
    {
        $regexCount = $this->_config->get('limitCountRegex');

        if (!array_key_exists('regexes', $data)) {
            $this->_errorCode = 110;
            $this->_errorMessage = 'Request data is missing the regexes field';
            return false;
        } elseif (!is_array($data['regexes'])) {
            $this->_errorCode = 111;
            $this->_errorMessage = 'Request data.regexes is invalid. '.
                'Expecting array. Found '.gettype($data['regexes']).'.';
            return false;
        } else {
            $c = count($data['regexes']);
            if ($c === 0) {
                $this->_errorCode = 112;
                $this->_errorMessage = 'Request data.regexes contains '.
                    'no regular expressions. What\'s the point of '.
                    'this request?';
                return false;
            } elseif ($regexCount > 0 && $c > $regexCount) {
                $this->_errorCode = 113;
                $this->_errorMessage = 'Request data.regexes '.
                    'contains too many regular expressions. '.
                    'Naughty! Naughty! We only allow '.
                    $regexCount.'. Received '.$c;
                return;
            } else {
                $func = ($this->_mode === 'test') ? 'Test' : 'Replace';
                $func = '_validate'.$func.'Regex';

                foreach ($data['regexes'] as $regex) {
                    $tmp = $this->$func($regex);
                    if ($tmp === false) {
                        return false;
                    } else {
                        $this->_regexes[] = $tmp;
                    }
                    unset($tmp);
                }
                unset($func, $c);
            }
        }
        return true;
    }

    /**
     * Test and import sample part of regex
     *
     * @param array $data Associative array from from parsed JSON data
     *
     * @return void
     */
    private function _validateAllSamples(
        array $data
    ) {
        $sampleCount = $this->_config->get('limitCountSample');
        $maxSampleLen = $this->_config->get('limitMaxLengthSingleSample');
        $totalSampleLen = $this->_config->get('limitMaxLengthTotalSample');

        if ($this->_mode !== 'test') {
            if (!array_key_exists('samplestrings', $data)) {
                $this->_errorCode = 120;
                $this->_errorMessage = 'Request data is missing the '.
                    'samplestrings field';
                return;
            } elseif (!is_array($data['samplestrings'])) {
                $this->_errorCode = 121;
                $this->_errorMessage = 'Request data.samplestrings is '.
                   'invalid. Expecting array. Found '.
                   gettype($data['samplestrings']).'.';
                return;
            } else {
                $c = count($data['samplestrings']);
                if ($c === 0) {
                    $this->_errorCode = 122;
                    $this->_errorMessage = 'Request data.samplestrings '.
                        'contains no sample strings. '.
                        'You must provide at least one empty string';
                    return;
                } elseif ($sampleCount > 0 && $c > $sampleCount) {
                    $this->_errorCode = 113;
                    $this->_errorMessage = 'Request data.samplestrings '.
                        'contains too many sample strings. '.
                        'Naughty! Naughty! We only allow '.
                        $sampleCount.
                        '. Received '.$c;
                    return;
                } else {
                    // If we only have one sample, then it can be as
                    // long as the total sample length
                    $maxSampleLen = ($c === 1) ?
                        $totalSampleLen :
                        $maxSampleLen;
                    $total = 0;

                    for ($a = 0; $a < $c; $a += 1) {
                        $sample = $data['samplestrings'][$a];
                        $len = strlen($sample);
                        $total += $len;

                        if ($maxSampleLen > 0
                            && $len > $maxSampleLen
                        ) {
                            $this->_errorCode = 114;
                            $this->_errorMessage = 'Request data.samplestrings '.
                            'contains a sample with too many '.
                            'characters. We only allow '.
                            $maxSampleLen.'characters per sample. '.
                            'Received '.$len;
                            return;
                        } elseif ($totalSampleLen > 0
                            && $total > $totalSampleLen
                        ) {
                            $this->_errorCode = 115;
                            $this->_errorMessage = 'The cumulative '.
                            'character count of data.samplestrings ('.
                            $total.') excedes the maximum cumulative '.
                            'character count ('.$totalSampleLen.
                            ') this instance of RegexAPI will process';
                            return;
                        }
                        $this->_samples[] = $sample;

                        unset($sample, $len);
                    }
                    unset($total, $a);

                }
                unset($c);
            }

            if (!array_key_exists('chainRegexes', $data)) {
                $this->_errorCode = 130;
                $this->_errorMessage = 'Request data is missing the '.
                    'chainRegexes field';
                return;
            } elseif (!is_bool($data['chainRegexes'])) {
                $this->_errorCode = 131;
                $this->_errorMessage = 'Request data.chainRegexes is '.
                   'invalid. Expecting boolean. Found '.
                   gettype($data['chainRegexes']).'.';
                return;
            } else {
                $this->_chainRegexes = $data['chainRegexes'];
            }

            if ($this->_mode === 'match') {
                if (!$this->_validateMatchConfig($data)) {
                    return;
                }
            }
        }
    }


    /**
     * Test and set "type" of request
     *
     * @param array $data Associative array from from parsed JSON data
     *
     * @return boolean
     */
    private function _validateType($data)
    {

        if (!array_key_exists('type', $data)) {
            $this->_errorCode = 100;
            $this->_errorMessage = 'Request data is missing the type field';
            return false;
        } elseif (!is_string($data['type'])) {
            $this->_errorCode = 101;
            $this->_errorMessage = 'Request data.type is invalid. '.
                'Expecting string. Found '.gettype($data['type']).'.';
            return false;
        } elseif (!in_array($data['type'], $this->_modes)) {
            $this->_errorCode = 102;
            $this->_errorMessage = 'Request data.type is invalid. '.
                'Expecting one of the following: "'.
                implode('", "', $this->_modes).'". '.
                'Found: "'.$data['type'].'"';
            return false;
        } else {
            $this->_mode = $data['type'];
            return true;
        }
    }
}

