function call_cj_api($url, $data, $token = null) {
        $headers = [
            "Content-Type: application/json",
            "Accept: application/json"
        ];

        if ($token) {
            $headers[] = "CJ-Gateway-APIKey: {$token}";
        }

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data, JSON_UNESCAPED_UNICODE),
            CURLOPT_HTTPHEADER => $headers
        ]);
        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            // 返回标准结构用于后续判断
            return [
                'RESULT_CD' => 'F',
                'ERROR_MSG' => $error
            ];
        }

        $decoded = json_decode($response, true);
        if (!is_array($decoded)) {
            return [
                'RESULT_CD' => 'F',
                'ERROR_MSG' => '响应格式错误',
                'RAW_RESPONSE' => $response
            ];
        }

        return $decoded;
    }