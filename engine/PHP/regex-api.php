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
$maxPartMatch = 500;
$maxRegexes = 30;
$maxSamples = 2048;
$maxSampleLength = 4096;
$maxTotalSampleLength = 32768;

require_once __DIR__.'regex-api.class.php';

Regex::setMaxWhole($maxWholeMatch);
Regex::setMaxPart($maxPartMatch);
RegexAPI::setMaxRegexes($maxRegexes);
RegexAPI::setMaxSamples($maxSamples);
RegexAPI::setMaxSampleLength($maxSampleLength);

$data = array_key_exists('data', $_POST) ? $_POST['data'] : false;

if ($data === false) {
    $config = array_key_exists('config', $_POST) ? true : false;
    if ($config === true) {
        $output = array(
            'ok' => true,
            'code' => 201,
            'content' => RegexAPI::getConfig(),
            'message' => 'data object was not supplied',
            'hasTiming' => false
        );
        
    } else {
        $output = array(
            'ok' => false,
            'code' => 200,
            'content' => array(''),
            'message' => 'data object was not supplied',
            'hasTiming' => false
        );
    }
    echo json_encode($output);
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

$regexAPI = new RegexAPI($data);

echo $regexAPI->getResponseJSON();

exit;
