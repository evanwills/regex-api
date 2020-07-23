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


define('REGEX_API_CONFIG', true);

/**
 * Handle user supplied request data
 *
 * @category RegexAPI
 * @package  RegexAPI
 * @author   Evan Wills <evan.wills@gmail.com>
 * @license  MIT <url>
 * @link     https://github.com/regex-api
 */
class RegexAPIconfig
{
    // ==========================================
    // START: config properties

    /**
     * User Interface default values (to be provided) when client
     * makes a 'getConfig' request
     *
     * @var array
     */
    private $_sample = array(
        'split' => array(
            'allow' => true,
            'do' => false,
            'char' => '\n'
        ),
        'trim' => array(
            'allow' => true,
            'do' => false,
            'before' => false,
            'after' => false
        ),
        'nomaliseLineEnd' => array(
            'allow' => true,
            'do' => false,
            'char' => '\n'
        )
    );
    private $_regex = array(
        'delimiters' => array(
            'open' => '`',
            'close' => '`'
        ),
        'modifiers' => 'is',
        'multiLine' => false,
        'fullWidth' => false
    );
    private $_returned = array(
        'maxLength' => array(
            'captured' => 300,
            'whole' => 300,
            'sample' => 300
        ),
        'showWhiteSpace' => true
    );
    private $_limit = array(
        'count' => array(
            'regex' => 0,
            'sample' => 0
        ),
        'maxLength' => array(
            'singleRegex' => 0,
            'singleSample' => 0,
            'totalSample' => 0,
            'totalRequest' => 0
        )
    );

    /**
     * Flat associative array where each key matches the case
     * insensitive (lowercase) version of one of the keys used in
     * UIdefaults.
     *
     * Makes setting default values easier because keys become more
     * tollerant of unimportant casing (and in some case localisation)
     *
     * @var array
     */
    private $_iKeys = array();

    /**
     * Flat associative array where each key matches the case
     * insensitive (lowercase) version of one of the keys used in
     * UIdefaults.
     *
     * Makes setting default values easier because keys become more
     * tollerant of unimportant casing (and in some case localisation)
     *
     * @var array
     */
    private $_iSingleKeys = array();

    /**
     * Error message for invalid config value
     *
     * @var string
     */
    private $_message = '';

    /**
     * Whether or not to expose $_limit values when sending config
     * info
     *
     * NOTE: This does not prevent specifically getting a single
     *       limit value
     *
     * @var boolean
     */
    private $_exposeLimit = false;


    //  END:  config properties
    // ==========================================
    // START: Constructor


    /**
     * RegexAPI Config constructor
     *
     * @param boolean $input Whether or not to send limit info when
     *                       outputting whole config
     */
    public function __construct(bool $input = false)
    {
        $this->_exposeLimit = $input;

        $this->_getIkeys($this->_sample, 'sample');
        $this->_getIkeys($this->_regex, 'regex');
        $this->_getIkeys($this->_returned, 'returned');
        $this->_getIkeys($this->_limit, 'limit');
        $this->_americanise();

        ksort($this->_iKeys);
        ksort($this->_iSingleKeys);

        // debug($this->_iKeys, $this->_iSingleKeys);
    }


    //  END:  Constructor
    // ==========================================
    // START: public (static) config methods


    /**
     * Get basic config info about this regex engine
     *
     * @param string,false $prop Key for first level in defaults
     *                           array
     * @param string,false $key1 Key for second level in defaults
     *                           array
     * @param string,false $key2 Key for third level in defaults
     *                           array
     *
     * @return array,string,bool,int
     */
    public function getConfig($prop = false, $key1 = false, $key2 = false)
    {
        if ($prop === false) {
            $output = array(
                'sample' => $this->_sample,
                'regex' => $this->_regex,
                'returned' => $this->_returned
            );
            if ($this->_exposeLimit) {
                $output['limit'] = $this->_limit;
            }
            return $output;
        }

        $prop = $this->_getKeyInsensitive($prop);
        $key1 = $this->_getKeyInsensitive($key1);
        $key2 = $this->_getKeyInsensitive($key2);

        $prop = ($prop !== false) ? '_'.$prop : false;

        if ($prop !== false && property_exists($this, $prop)) {
            if ($key1 !== false) {
                if (array_key_exists($key1, $this->$prop)) {
                    if ($key2 !== false) {
                        if (array_key_exists($key2, $this->{$prop}[$key1])) {
                            return $this->{$prop}[$key1][$key2];
                        } else {
                            throw new Exception(
                                '"'.$key2.'" does not exist in '.
                                'RegexAPIconfig::$_'.$prop.'['.$key1.']'
                            );
                        }
                    } else {
                        return $this->{$prop}[$key2];
                    }
                } else {
                    throw new Exception(
                        '"'.$key1.'" does not exist in '.
                        'RegexAPIconfig::$_'.$prop
                    );
                }
            } else {
                return $this->$prop;
            }
        } else {
            throw new Exception(
                '"'.$prop.'" is not a RegexAPIconfig property'
            );
        }
    }

    /**
     * Shorthand method for getConfig
     *
     * @param string $field Key that matches the combined ancestor
     *                      keys of the property to be returned
     *
     * @return string,int,bool
     */
    public function get($field)
    {
        if (!is_string($field) || trim($field) === '') {
            throw new Exception(
                'RegexAPIconfig::get() expects only parameter to '.
                'be a non-empty string'
            );
        }

        $_field = strtolower($field);
        if (array_key_exists($_field, $this->_iSingleKeys)) {
            return call_user_func_array(
                array($this, 'getConfig'),
                $this->_iSingleKeys[$_field]
            );
        } else {
            throw new Exception(
                'RegexAPIconfig::get() expects only parameter to '.
                'be a string matching the combined keys for a '.
                'single config property. "'.$field.'" does not '.
                'match any of the fillowing: "'.
                implode('", "', $this->_iSingleKeys).'"'
            );
        }
    }

    /**
     * Set one of the default values for this class
     *
     * @param string,int,bool $input New value to replace existing
     *                               default
     * @param string          $prop  Key for first level in defaults
     *                               array
     * @param string          $key1  Key for second level in defaults
     *                               array
     * @param string          $key2  Key for third level in defaults
     *                               array
     *
     * @return true On success. Throws Exception on failure
     */
    public function setConfig(
        $input,
        string $prop,
        string $key1,
        string $key2 = ''
    ) {
        $updated = '';
        $methodName = '';
        $message = '';
        // debug($prop, $key1, $key2);
        $prop = '_'.$this->_getKeyInsensitive($prop);
        $key1 = $this->_getKeyInsensitive($key1);
        $key2 = $this->_getKeyInsensitive($key2, true);
        $level = 0;

        // debug($prop, $key1, $key2);

        $input = (is_string($input)) ? trim($input) : $input;

        $ok = true;

        if ($prop !== false && property_exists($this, $prop)) {
            $methodName = '_valid'.ucfirst($prop);
            $updated .= 'RegexAPIconfig::$_'.$prop;
            $level = 1;

            if ($key1 !== false && array_key_exists($key1, $this->$prop)) {
                $updated .= '['.$key1.']';
                $methodName .= ucfirst($key1);
                $level = 2;

                if ($key2 !== false) {
                    if ($key2 !== '') {
                        if (array_key_exists($key2, $this->$prop[$key1])) {
                            $updated .= '['.$key2.']';
                            $methodName .= ucfirst($key2);
                            $level = 3;
                            $tmp = $this->_isSameType(
                                $input,
                                $this->$prop[$key1][$key2]
                            );
                            if ($tmp !== '') {
                                $ok = false;
                                $this->_message = $tmp;
                            }
                        } else {
                            $ok = false;
                            $this->_message = '"'.$key2.'" does not exist!.';
                        }
                    } else {
                        $tmp = $this->_isSameType(
                            $input,
                            $this->$prop[$key1]
                        );
                        if ($tmp !== '') {
                            $ok = false;
                            $this->_message = $tmp;
                        }
                    }
                } else {
                    throw new Exception(
                        'RegexAPIconfig::setConfig() expects fourth '.
                        'parameter $key2 to be string matching a '.
                        'key for the RegexAPIconfig::$'.$prop.
                        '['.$key1.']'
                    );
                }
            } else {
                throw new Exception(
                    'RegexAPIconfig::setConfig() expects third parameter '.
                    '$key1 to be a string matching key for the '.
                    'RegexAPIconfig::$'.$prop
                );
            }
        } else {
            throw new Exception(
                'RegexAPIconfig::setConfig() expects second parameter '.
                '$prop to be a config property name'
            );
        }

        if ($ok === true) {
            if (method_exists($this, $methodName)) {
                $ok = $this->$methodName($input);
            } elseif (is_string($input)) {
                $ok = $this->_validChar($input, $prop, $key1, $key2);
            } elseif (is_int($input)) {
                $ok = $this->_validMaxInt($input, $prop, $key1, $key2);
            } elseif (is_bool($input)) {
                if ($level === 2) {
                    $this->{$prop}[$key1] = $input;
                } elseif ($level === 3) {
                    $this->{$prop}[$key1][$key2] = $input;
                } else {
                    $ok = false;
                }
            }
        }

        if ($ok === true) {
            return true;
        }

        throw new Exception(
            'Cannot update default value for '.$updated.' '.$this->_message
        );
    }

    /**
     * Shorthand method for getConfig
     *
     * @param string          $field Key that matches the combined
     *                               ancestor keys of the property
     *                               to be returned
     * @param string,int,bool $value Config value to be set
     *
     * @return string,int,bool
     */
    public function set($field, $value)
    {
        if (!is_string($field) || trim($field) === '') {
            throw new Exception(
                'RegexAPIconfig::get() expects first parameter to '.
                'be a non-empty string'
            );
        }

        $_field = strtolower($field);
        if (array_key_exists($_field, $this->_iSingleKeys)) {
            $params = array_merge(
                array($value),
                $this->_iSingleKeys[$_field]
            );
            return call_user_func_array(
                array($this, 'setConfig'),
                $params
            );
        } else {
            throw new Exception(
                'RegexAPIconfig::set() expects first parameter '.
                '$field to be a string matching the combined keys '.
                'for a single config property. "'.$field.'" does '.
                'not match any of the fillowing: "'.
                implode('", "', $this->_iSingleKeys).'"'
            );
        }
    }

    /**
     * Set multiple RegexAPI config values with a single call
     *
     * @param array $fields Flat associative array of key/value pairs
     *
     * @return boolean TRUE if all values were set
     */
    public function setMulti(array $fields)
    {
        // debug($fields);
        foreach ($fields as $key => $value) {
            try {
                // debug('about to set config value', $key, "\$value: $value");
                $this->set($key, $value);
            } catch (Exception $e) {
                $find = array('::setConfig', 'first parameter $field');
                $replace = array('::setMulti', 'config key');
                throw new Exception(
                    str_replace($find, $replace, $e->getMessage())
                );
                return false;
            }
        }
        return true;
    }

    /**
     * Set multiple default values at once.
     *
     * @param array $defaults Array of new defaults to be set
     *
     * @return true If any defaults are invalid this method with
     *              throw and exception
     */
    public function setDefaultsMulti($defaults)
    {
        $output = $this->_setDefaultsMulti($defaults);

        if (is_array($output)) {
            throw new Exception(
                "Some default values were invalid:\n = ".
                implode("\n - ", $output)
            );
        } else {
            return true;
        }
    }


    //  END:  public (static) config methods
    // ==========================================
    // START: private config helper methods


    /**
     * Does the actual work of setting API UI defaults
     *
     * @param array        $newDefaults         Array of default
     *                                          values to be set
     * @param string,false $parentKey           Key from parent array
     * @param string,false $grandParentKey      Key from grand parent
     *                                          array
     * @param string,false $greatGrandParentKey Key from great grand
     *                                          parent array
     *
     * @return array,true
     */
    private function _setDefaultsMulti(
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
                        array($this, 'setConfig'),
                        $tmp
                    );
                } catch (Exception $e) {
                    $output[] = $e->getMessage();
                }
            } else {
                $output = array_merge(
                    $output,
                    call_user_func_array(
                        array($this, '_setDefaultsMulti'),
                        $tmp
                    )
                );
            }
        }

        return (count($output) > 0) ? $output : true;
    }

    /**
     * Test whether a given character is valid to use as either a
     * line end character or a split character
     *
     * @param string $char character to be tested
     * @param string $prop Key for first level in defaults array
     * @param string $key1 Key for second level in defaults array
     * @param string $key2 Key for third level in defaults array
     *
     * @return boolean
     */
    private function _validChar($char, $prop, $key1, $key2)
    {
        $len = strlen($char);

        if ($len > 4 || $len <= 0) {
            // A minimum of 1 character and maximum of four
            // characters is allowed
            return false;
        } elseif ($key1 === 'normaliseLineEnd') {
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
        $this->{$prop}[$key1][$key2] = $char;
        return true;
    }

    /**
     * Test whether an input is an integer and greater than
     * (or equal to) zero
     *
     * @param integer $input Number to be tested
     * @param string  $prop  Key for first level in defaults array
     * @param string  $key1  Key for second level in defaults array
     * @param string  $key2  Key for third level in defaults array
     *
     * @return boolean
     */
    private function _validMaxInt($input, $prop, $key1, $key2)
    {
        if (is_int($input) && $input >= 0) {
            $this->{$prop}[$key1][$key2];
            return true;
        }
        $this->_message = 'Must be greater than or equal to zero';
        return false;
    }

    /**
     * Check whether the imput contains only valid PCRE (and API)
     * modifiers
     *
     * @param string $input Modifiers to be checked
     *
     * @return boolean
     */
    private function _validRegexModifiers(string $input)
    {
        $tmpVal = str_split($input);
        for ($a = 0; $a < count($tmpVal); $a += 1) {
            if (!regex::modifierIsAllowed($tmpVal[$a])) {
                $this->message = 'Modifier "'.$tmpVal[$a].'" is invalid.';
                return false;
            }
        }
        $this->_regex['modifiers'] = $input;
        return true;
    }


    /**
     * Check whether the input contains a single valid delimiter
     *
     * @param string $input Character to be used as a delimiter
     *
     * @return boolean
     */
    private function _validRegexDelimiters($input)
    {
        $delim = regex::getPairedDelimiter($input);
        if ($delim === false) {
            $this->_message = 'Delimiter "'.$input.'" is invalid.';
            return false;
        }

        $this->_regex['delimiters'] = $delim;
        return true;
    }

    /**
     * Alias method for RegexAPIconfig::_validRegexDelimiters()
     *
     * Check whether the input contains a single valid delimiter
     *
     * @param string $input Character to be used as a delimiter
     *
     * @return boolean
     */
    private function _validRegexDelimitersOpen($input)
    {
        return $this->_validRegexDelimiters($input);
    }

    /**
     * Alias method for RegexAPIconfig::_validRegexDelimiters()
     *
     * Check whether the input contains a single valid delimiter
     *
     * @param string $input Character to be used as a delimiter
     *
     * @return boolean
     */
    private function _validRegexDelimitersClose($input)
    {
        return $this->_validRegexDelimiters($input);
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
    private function _isSameType($val1, $val2)
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
     * Get the case sensitive version of a defaults key using a case
     * insensitive comparrision test
     *
     * @param string  $key        Case insensitive array key for API
     *                            User interface default setting
     * @param boolean $allowEmpty Whether or not to return FALSE if
     *                            key is an empty string
     *
     * @return string,false Case sensitive version of supplied key or
     *                      FALSE if key doesn't exist.
     */
    private function _getKeyInsensitive($key, $allowEmpty = false)
    {
        if (!is_string($key)) {
            return false;
        }
        $key = trim($key);
        if ($key === '') {
            return ($allowEmpty === true) ? '' : false;
        }

        $key = strtolower($key);
        if (substr($key, 0, 1) === '_') {
            $key = substr($key, 1);
        }

        if (array_key_exists($key, $this->_iKeys)) {
            return $this->_iKeys[$key];
        } else {
            false;
        }
    }

    /**
     * Recursive function to get all the keys for $this->_UIdefaults to
     * allow for case insensitive matching of keys.
     *
     * @param array        $defaults  array of key/value pairs.
     * @param string,array $ancestors All the ancestor keys
     *
     * @return array Flat array of key/value pairs where the key is
     *               the all lowercase version of the value
     */
    private function _getIkeys(array $defaults, $ancestors)
    {
        if (is_string($ancestors)) {
            if (property_exists($this, '_'.$ancestors)) {
                $_ancestors = strtolower($ancestors);
                $this->_iKeys[$_ancestors] = $ancestors;
                $ancestors = array('_'.$_ancestors);

            } else {
                throw new Exception(
                    'Private method RegexAPIconfig::_getIKeys() '.
                    'expects second parameter $ancestors to be a '.
                    'string matching one of the API\'s config '.
                    'properties. "'.$ancestors.'" does not match '.
                    'any.'
                );
            }
        }

        foreach ($defaults as $key => $value) {
            $_ancestors = $ancestors;
            $_key = strtolower($key);
            $_ancestors[] = $key;

            $this->_iKeys[$_key] = $key;
            if (is_array($value)) {
                $this->_getIkeys(
                    $value,
                    $_ancestors
                );
            } else {
                $oneKey = strtolower(implode('', $_ancestors));
                $oneKey = substr($oneKey, 1);
                $this->_iSingleKeys[$oneKey] = $_ancestors;
            }
        }
    }

    /**
     * Add American "iZe" versions of keys because american's can't
     * spell
     *
     * @return void
     */
    private function _americanise()
    {
        foreach ($this->_iKeys as $key => $value) {
            $_key = str_replace('ise', 'ize', $key);
            if ($_key !== $key) {
                $this->_iKeys[$_key] = $value;
            }
        }
        foreach ($this->_iSingleKeys as $key => $value) {
            $_key = str_replace('ise', 'ize', $key);
            if ($_key !== $key) {
                $this->_iSingleKeys[$_key] = $value;
            }
        }
    }
}

