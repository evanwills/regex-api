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

header('Content-Type:application/json');

require_once __DIR__.'/bootstrap.inc.php';

require_once __DIR__.'/regex.class.php';
require_once __DIR__.'/regex-api-config.class.php';

$config = new RegexAPIconfig();

require_once __DIR__.'/regex-api.config.php';
require_once __DIR__.'/regex-api.class.php';

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
