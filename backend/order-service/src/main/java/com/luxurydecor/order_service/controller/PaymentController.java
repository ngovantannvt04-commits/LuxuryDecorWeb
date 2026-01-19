package com.luxurydecor.order_service.controller;

import com.luxurydecor.order_service.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;
import java.util.Map;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @GetMapping("/create_payment")
    public ResponseEntity<?> createPayment(
            HttpServletRequest request,
            @RequestParam long amount,
            @RequestParam String orderInfo,
            @RequestParam String orderId
    ) throws UnsupportedEncodingException {

        String paymentUrl = paymentService.createVnPayPayment(request, amount, orderInfo,  orderId);

        return ResponseEntity.ok(Map.of("url", paymentUrl));
    }

    @GetMapping("/vnpay-callback")
    public ResponseEntity<?> paymentCallback(@RequestParam Map<String, String> queryParams) {
        Map<String, Object> result = paymentService.paymentCallback(queryParams);
        return ResponseEntity.ok(result);
    }
}
