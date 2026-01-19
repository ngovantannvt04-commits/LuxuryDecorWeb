package com.luxurydecor.order_service.service;

import com.luxurydecor.order_service.config.VNPayConfig;
import com.luxurydecor.order_service.entity.Order;
import com.luxurydecor.order_service.enums.OrderStatus;
import com.luxurydecor.order_service.repository.OrderRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class PaymentService {

    @Autowired
    private OrderRepository orderRepository;

    public String createVnPayPayment(HttpServletRequest request, long amount, String orderInfo, String orderId) throws UnsupportedEncodingException {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";

        // Số tiền (VNPay yêu cầu nhân 100)
        long amountVal = amount * 100;

        String bankCode = "";

        String vnp_TxnRef = orderId;
        String vnp_IpAddr = VNPayConfig.getIpAddress(request);

        String vnp_TmnCode = VNPayConfig.vnp_TmnCode;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amountVal));
        vnp_Params.put("vnp_CurrCode", "VND");

        if (bankCode != null && !bankCode.isEmpty()) {
            vnp_Params.put("vnp_BankCode", bankCode);
        }
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", orderInfo);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", VNPayConfig.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Sắp xếp tham số theo a-z để tạo checksum đúng
        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        // In ra chuỗi dữ liệu thô trước khi Hash để kiểm tra
        System.out.println("------------------------------------------------");
        System.out.println("Raw Hash Data: " + hashData.toString());
        System.out.println("Secret Key: " + VNPayConfig.vnp_HashSecret);
        System.out.println("------------------------------------------------");
        // Tạo Secure Hash
        String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        return VNPayConfig.vnp_PayUrl + "?" + queryUrl;
    }

    public Map<String, Object> paymentCallback(Map<String, String> queryParams) {
        Map<String, Object> result = new HashMap<>();

        try {
            // Lấy vnp_SecureHash từ URL ra để đối chiếu
            String vnp_SecureHash = queryParams.get("vnp_SecureHash");

            // Loại bỏ các params không tham gia vào tạo checksum
            if (queryParams.containsKey("vnp_SecureHashType")) {
                queryParams.remove("vnp_SecureHashType");
            }
            if (queryParams.containsKey("vnp_SecureHash")) {
                queryParams.remove("vnp_SecureHash");
            }

            // Sắp xếp và Hash lại dữ liệu để kiểm tra tính toàn vẹn
            List fieldNames = new ArrayList(queryParams.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            Iterator itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = (String) itr.next();
                String fieldValue = (String) queryParams.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                }
            }

            String signValue = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());

            // Check checksum
            if (signValue.equals(vnp_SecureHash)) {
                String orderId = queryParams.get("vnp_TxnRef"); // Lấy lại Order ID đã gửi đi
                // Tìm đơn hàng và update
                Order order = orderRepository.findById(orderId).orElse(null);
                // Checksum đúng -> Kiểm tra tình trạng thanh toán
                if ("00".equals(queryParams.get("vnp_ResponseCode"))) {

                    // THANH TOÁN THÀNH CÔNG
                    if (order != null) {
                        order.setPaymentStatus("PAID");
                        order.setStatus(OrderStatus.CONFIRMED);
                        orderRepository.save(order);

                        result.put("status", "success");
                        result.put("message", "Thanh toán thành công");
                        result.put("orderId", orderId);
                    } else {
                        result.put("status", "error");
                        result.put("message", "Không tìm thấy đơn hàng");
                    }
                } else {
                    // THANH TOÁN THẤT BẠI (Do hủy hoặc lỗi thẻ)
                    if (order != null) {
                        order.setPaymentStatus("FAILED");
                        order.setStatus(OrderStatus.CANCELLED);
                        orderRepository.save(order);
                    }
                    result.put("status", "failed");
                    result.put("message", "Giao dịch thất bại");
                }
            } else {
                // CHECKSUM SAI (Có dấu hiệu giả mạo)
                result.put("status", "error");
                result.put("message", "Chữ ký không hợp lệ");
            }
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", "Lỗi xử lý: " + e.getMessage());
        }
        return result;
    }
}
