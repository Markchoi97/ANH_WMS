/**
     * 订单导入
     */
    public function imports()
    {
        if ($this->request->isPost()) {
            $file = $this->request->file('file');
// 判断配置发件人信息
            $sender = Db::name('admin_addr')->where(['uid' => $this->auth->id])->find();
            if (empty($sender)) $this->error('请配置寄件信息', 'general/profile');
            if (!$file) {
                $this->error('请选择上传文件');
            }
            $filePath = $file->getRealPath();
            $spreadsheet = IOFactory::load($filePath);
            $sheet = $spreadsheet->getSheet(0);
            $rows = $sheet->toArray();

// 验证表头
            $header = array_shift($rows);
// 过滤掉空值
            $header = array_filter($header, function($value) {
                return $value !== null && $value !== '';
            });
// 重置索引（如果需要）
            $header = array_values($header);

            $expectedHeader = ['订单号', '退单号', '收件人姓名', '收件人电话', '收件地址', '收件人邮编', '商品名称', '备注'];

            if ($header != $expectedHeader) {
                $this->error('模板格式不正确，请下载最新模板');
            }
            $waybillcount = Db::name('waybill')->where(['status' => 1, 'deleted' => 0, 'logistics_company' => 'CJ'])->count();

            // 处理导入数据
            $successCount = 0;
            $errorData = [];
            Db::startTrans();
            foreach ($rows as $index => $row) {
                $orderNo = $row[0] ?? '';
                $returnNo = $row[1] ?? '';
                $receiverName = $row[2] ?? '';
                $receiverPhone = $row[3] ?? '';
//                $receiverRegion = $row[4] ?? '';
                $receiverAddress = $row[4] ?? '';
                $receiverZipcode = $row[5] ?? '';
                $productName = $row[6] ?? '';
                $remark = $row[7] ?? '';
//                $box = $row[9] ?? '';
                // 数据验证
                if (empty($orderNo) || empty($receiverName) || empty($receiverPhone)) {
                    $errorData[] = "第" . ($index + 2) . "行数据不完整";
                    continue;
                }

                // 检查订单是否已存在
                if ($this->model->where('order_no', $orderNo)->find()) {
                    $errorData[] = "第" . ($index + 2) . "行订单号已存在";
                    continue;
                }

                /*if ($waybillcount < count($rows)) {
                    $this->error('运单号不充足，请联系客户补充');
                }*/
                try {
                    //取一个运单号并将其改为1
//                       $findwaybill =  Db::name('waybill')->where(['status'=>1,'deleted'=>0,'logistics_company'=>'CJ'])->find();
                    //取个单号
                    $waybill = $this->waybills($orderNo);
                    // 准备主表数据（整合两个版本的字段）
                    $orderMainData = [
                        'order_no' => $orderNo,
                        'return_no' => $returnNo ?? '',
                        'product_name' => $productName ?? '',
                        'remark' => $remark ?? '',
                        'create_time' => date('Y-m-d H:i:s'),
                        'user_id' => $this->auth->id,
                        'wz_id' => md5($orderNo . ($returnNo ?? '') . ($remark ?? '') . time() . $this->auth->id),
                        'tracking_no' => $waybill ?? '',
                    ];
                    // 插入主表数据（两种方式兼容）
                    $orderId = $this->model->insertGetId($orderMainData); // 使用模型方式
                    // 或者：$orderId = Db::name('order_main')->insertGetId($orderMainData);
//                        Db::name('waybill')->where(['number'=>$findwaybill['number']])->update(['status'=>0,'order_id'=>$orderMainData['order_no']]);
                    if (!$orderId) {
                        throw new Exception('主表数据插入失败');
                    }

                    // 准备收件人表数据（整合字段）
                    $receiverData = [
                        'receiver_name' => $receiverName,
                        'receiver_phone' => $receiverPhone,
                        'receiver_zipcode' => $receiverZipcode ?? '',
//                        'receiver_region' => $receiverRegion ?? '',
                        'receiver_address' => $receiverAddress ?? '',
                        'create_time' => date('Y-m-d H:i:s'),
                        'wz_id' => $orderMainData['wz_id'],
//                        'box'=>$box
                    ];
                    // 插入收件人表数据
                    $receiverId = Db::name('order_receiver')->insertGetId($receiverData);
                    if (!$receiverId) {
                        throw new Exception('收件人数据插入失败');
                    }

                    // 更新主表的收件人ID（如果需要）
                    $updateResult = Db::name('order_main')
                        ->where('id', $orderId)
                        ->update(['receiver_id' => $receiverId]);

                    if ($updateResult === false) {
                        throw new Exception('收件人ID更新失败');
                    }
                    //插入仓库表
                    $storeData = [
                        'tracking_no' =>$waybill,
                        'order_id' => $orderMainData['order_no'],
                        'operator_id' => $this->auth->id,
                        'create_time' => date('Y-m-d H:i:s'),
                    ];
                    $savesotre = Db::name('scan_store')->insertGetId($storeData);

                    if ($savesotre === false) {
                        throw new Exception('入库失败');
                    }
                    $this->model->where('order_no', $orderNo)->update(['tracking_no' =>$waybill]);
                    //订单数据发送给CJ
                    $this->Regbook($waybill,$sender);
                    Db::commit();
                    $successCount++;
                } catch (Exception $e) {
                    Db::rollback();
                    $errorData[] = "第" . ($index + 2) . "行处理失败：" . $e->getMessage();
                }
            }

            Db::commit();

            $msg = "成功导入 {$successCount} 条数据";
            if (!empty($errorData)) {
                $msg .= "，失败 " . count($errorData) . " 条：" . implode('；', $errorData);
            }

            $this->success($msg, null, [

            ]);
        }
        return $this->view->fetch();

    }