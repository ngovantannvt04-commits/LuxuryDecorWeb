package com.luxurydecor.product_service.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> response = new HashMap<>();

        // Lấy lỗi đầu tiên tìm thấy để thông báo cho gọn
        String errorMessage = ex.getBindingResult().getFieldError().getDefaultMessage();

        response.put("message", errorMessage);

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleUnwantedException(Exception e) {
        return ResponseEntity.status(500).body("Lỗi Server: " + e.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {
        Map<String, String> response = new HashMap<>();
        // Trả về đúng key "message" để khớp với Frontend
        response.put("message", e.getMessage());

        // Trả về status 400 (Bad Request)
        return ResponseEntity.badRequest().body(response);
    }
}