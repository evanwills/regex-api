<?php
/**
 * This file takes user (HTTP POST) supplied data and returns
 *
 * PHP VERSION: ^7.4
 *
 * @category RegexAPI
 * @package  RegexAPI
 * @author   Evan Wills <evan.i.wills@gmail.com>
 * @license  MIT <url>
 * @link     https://github.com/regex-api
 */


require_once __DIR__.'/bootstrap.inc.php';

if (!function_exists('debug')) {
    function debug()
    {
    }
}

// ========================================================
// Start: Allow command line

// We want to be able to test the API from the command line
// calls as well as POST requests

$request = array();
if (isset($argv)) {
    // Call is coming from command line
    if (array_key_exists(1, $argv)) {
        switch($argv[1]) {
        case 'getConfig':
            // testing config
            $request['getConfig'] = true;
            break;
        case 'data':
            // Get "data" JSON object from third CLI argument
            if (array_key_exists(2, $argv)) {
                $request['data'] = $argv[2];
            }
            break;
        case 'file':
            // Get "data" JSON object from file
            if (array_key_exists(2, $argv) && is_file($argv[2])) {
                $request['data'] = file_get_contents($argv[2]);
            }
            break;
        }
    }
} else {
    // Call is coming from external request
    $request = $_POST;
    header('Content-Type:application/json');
}

//  END:  Allow command line
// ========================================================


require_once __DIR__.'/regex.class.php';
require_once __DIR__.'/regex-api-config.class.php';

$config = new RegexAPIconfig();

require_once __DIR__.'/regex-api.config.php';
require_once __DIR__.'/regex-api.class.php';

$data = array_key_exists('data', $request) ? $request['data'] : false;

if ($data === false) {
    $getConfig = array_key_exists('getConfig', $request);
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
                'code' => 199,
                'content' => array(''),
                'message' => 'data object was not supplied',
                'hasTiming' => false
            )
        );
    }
    exit;
}

if (!class_exists('RegexAPI')) {
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

$regexAPI = new RegexAPI($data, $config);

echo $regexAPI->getResponseJSON();

exit;
