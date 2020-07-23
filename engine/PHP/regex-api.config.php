<?php
/**
 * This file sets all the config values for the API
 *
 * NOTE: By default there are no limits on how many RegExes or
 *       samples are allowed or how long the regexes and samples
 *       can be. However in a hostile environment, this could allow
 *       malicious users to DoS the API (or entire server).
 *       I recommend doing some load testing on your server to work
 *       out what are appropriate limits for what this API accepts
 *       from potentially malicious users.
 *
 * PHP VERSION: ^7.4
 *
 * @category RegexAPI
 * @package  RegexAPI
 * @author   Evan Wills <evan.i.wills@gmail.com>
 * @license  MIT <url>
 * @link     https://github.com/regex-api
 */

if (!defined('REGEX_API_CONFIG')) {
    require_once __DIR__.'/regex-api-config.class.php';
}
if (!isset($config) || get_class($config) !== 'RegexAPIconfig') {
    $config = new RegexAPIconfig();
}


Regex::setMaxWhole(300);
Regex::setMaxCaptured(300);
// Regex::setAllowedDelimiters();
// Regex::setAllowedModifiers();

$newConfig = array(
    'limitCountRegex' => 30,
    'limitCountSample' => 2048,
    'limitMaxLengthSingleRegex' => 1024,
    'limitMaxLengthSingleSample' => 4096,
    'limitMaxLengthTotalSample' => 32768,
    'limitMaxLengthTotalRequest' => 65536,

    // ----------------------------------------------------
    // Predefine UI defaults for UI to fetch on load

    // 'regexDelimOpen', '`',
    // 'regexDelimClose', '`',
    // 'regexModifiers', 'is',
    // 'regexMultiline', false,
    // 'regexFullWidth', false,
    // 'sampleSplitAllow', true,
    // 'sampleSplitDo', false,
    // 'sampleSplitChar', false,
    // 'sampleTrimAllow', true,
    // 'sampleTrimDo', false,
    // 'sampleTrimBefore', false,
    // 'sampleTrimAfter', false,
    // 'sampleNomaliseLineEndAllow', false,
    // 'sampleNomaliseLineEndDo', false,
    // 'sampleNomaliseLineEndChar', '\n',
    // 'returnedMaxWhole', 300,
    // 'returnedMaxCaptured', 300,
    // 'returnedMaxSample', 300,
    // 'returnedShowWhiteSpace', true
    // ----------------------------------------------------
);


$config->setMulti($newConfig);


