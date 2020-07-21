<?php
/**
 * This file takes user (HTTP POST) supplied data and returns
 *
 * PHP VERSION: ^7.4
 *
 * @category RegexAPI
 * @package  RegexAPI
 * @author   Evan Wills <evan.wills@gmail.com>
 * @license  MIT <url>
 * @link     https://github.com/regex-api
 */

header('Content-Type:application/json');

$maxWholeMatch = 500;
$maxCapturedMatch = 500;
$maxRegexes = 30;
$maxSamples = 2048;
$maxSampleLength = 4096;
$maxTotalSampleLength = 32768;
$maxTotalRequestLength = 65536;

require_once __DIR__.'regex-api-config.class.php';
require_once __DIR__.'regex-api.class.php';

$config = new RegexAPIconfig();

Regex::setMaxWhole($maxWholeMatch);
Regex::setMaxCaptured($maxCapturedMatch);
// Regex::setAllowedDelimiters();
// Regex::setAllowedModifiers();

$config->setConfig($maxRegexes, 'limit', 'count', 'regex');
$config->setConfig($maxRegexes, 'limit', 'count', 'sample');
$config->setConfig($maxSampleLength, 'limit', 'maxLength', 'singleSample');
$config->setConfig($maxTotalSampleLength, 'limit', 'maxLength', 'totalSample');
$config->setConfig($maxTotalRequestLength, 'limit', 'maxLength', 'request');

// Predefine UI defaults for UI to fetch on load
// RegexAPI::setConfig('`',   'regex',    'delim',   'open');
// RegexAPI::setConfig('`',   'regex',    'delim',   'close');
// RegexAPI::setConfig('is',  'regex',    'modifiers');
// RegexAPI::setConfig(false, 'regex',    'multiline');
// RegexAPI::setConfig(false, 'regex',    'fullWidth');
// RegexAPI::setConfig(true,  'sample',   'split',   'allow');
// RegexAPI::setConfig(false, 'sample',   'split',   'do');
// RegexAPI::setConfig(false, 'sample',   'split',   'char');
// RegexAPI::setConfig(true,  'sample',   'trim',    'allow');
// RegexAPI::setConfig(false, 'sample',   'trim',    'do');
// RegexAPI::setConfig(false, 'sample',   'trim',    'before');
// RegexAPI::setConfig(false, 'sample',   'trim',    'after');
// RegexAPI::setConfig(300,   'returned', 'maxWhole');
// RegexAPI::setConfig(300,   'returned', 'maxCaptured');
// RegexAPI::setConfig(300,   'returned', 'maxSample');
// RegexAPI::setConfig(true,  'returned', 'showWhiteSpace');

$data = array_key_exists('data', $_POST) ? $_POST['data'] : false;

if ($data === false) {
    $getConfig = array_key_exists('getConfig', $_POST);
    if ($getConfig === true) {
        echo json_encode(
            array(
                'ok' => true,
                'code' => 0,
                'content' => $config->getConfig(),
                'message' => '',
                'hasTiming' => false
            )
        );
    } else {
        echo json_encode(
            array(
                'ok' => false,
                'code' => 200,
                'content' => array(''),
                'message' => 'data object was not supplied',
                'hasTiming' => false
            )
        );
    }
    exit;
}

if (!file_exists(__DIR__.'regex-api.class.php')) {
    echo json_encode(
        array(
            'ok' => false,
            'code' => 300,
            'content' => array(''),
            'message' => 'Server error: Could not find regex API code',
            'hasTiming' => false
        )
    );
    exit;
}

$regexAPI = new RegexAPI($data, $cconfig);

echo $regexAPI->getResponseJSON();

exit;
