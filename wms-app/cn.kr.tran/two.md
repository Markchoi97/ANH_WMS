function Regbook($invcNo,$sender)
    {
        $find = Db::name('logistics_company')->where(['mark' => 'CJ'])->find();
        if (!$find) {
            throw new Exception('CJ物流公司配置信息未找到');
        }

        $token = $find['hmacgen'];
        $clientId = $find['client_id'];
        $apiUrl = rtrim($find['api_url'], '/') . '/RegBook';

        $order = $this->model->where(['tracking_no' => $invcNo])->find();
        $order_receiver = Db::name('order_receiver')->where(['wz_id' => $order['wz_id']])->find();
        $data = [
            "DATA" => [
                "TOKEN_NUM" => $token,
                "CUST_ID" => $clientId,
                "RCPT_YMD" => date('Ymd'),
                "CUST_USE_NO" => $order['order_no'],
                "RCPT_DV" => "01",
                "WORK_DV_CD" => "01",
                "REQ_DV_CD" => "01",
                "MPCK_KEY" => $order['order_no'],
                "CAL_DV_CD" => "01",
                "FRT_DV_CD" => "03",
                "CNTR_ITEM_CD" => "01",
                "BOX_TYPE_CD" => "01", //盒子要删除
                "BOX_QTY" => 1,
                "FRT" => 6250,
                "CUST_MGMT_DLCM_CD" => "30564514",

                // 寄件人信息
                "SENDR_NM" => $sender['sender_name'],
                "SENDR_TEL_NO1" => "010",
                "SENDR_TEL_NO2" => "7179",
                "SENDR_TEL_NO3" => "8998",

                "SENDR_ZIP_NO" => "10009",
                "SENDR_ADDR" => "김포시 통진읍",
                "SENDR_DETAIL_ADDR" => "김포시 통진읍 서암고정로 295",

                // 收件人信息
                "RCVR_NM" => $order_receiver['receiver_name'],
                "RCVR_TEL_NO1" => "02",
                "RCVR_TEL_NO2" => "1577",
                "RCVR_TEL_NO3" => "1111", //多个电话号码
                "RCVR_ZIP_NO" => $order_receiver['receiver_zipcode'],
//                "RCVR_ADDR" => $order_receiver['receiver_region'],//地址
                "RCVR_ADDR" => $order_receiver['receiver_address'],//地址
                "RCVR_DETAIL_ADDR" => $order_receiver['receiver_address'],//详细地址
//                    "RCVR_DETAIL_ADDR" => "죽전동 1307, 꽃메마을아이파크 104동 1703호",
                // 运单号
                "INVC_NO" => $invcNo,
                "PRT_ST" => '02',//必须
                "DLV_DV" => '01',//必须
                // 商品明细（可选）
                "ARRAY" => [
                    [
                        "MPCK_SEQ" => "1",
                        "GDS_CD" => "2",
                        "GDS_NM" => "TX",
                        "GDS_QTY" => 1,
                        "UNIT_CD" => "11",
                        "UNIT_NM" => "TEST 2",
                        "GDS_AMT" => 15000
                    ]
                ]
            ]
        ];
        $post = new Waybill();
        $result = $post->call_cj_api($apiUrl, $data, $token);
        if (!isset($result['RESULT_CD'])) {
            $this->error('API响应格式异常');
        }

        if ($result['RESULT_CD'] === 'E') {
            $errorMsg = $result['RESULT_DETAIL'] ?? '未知错误';
            $this->error('CJ API错误: ' . $errorMsg);
        }
        $this->model->where(['tracking_no' => $invcNo])->update(['api_status' => 1]);
        return $result;
    }
