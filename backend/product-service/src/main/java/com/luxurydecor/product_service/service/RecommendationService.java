package com.luxurydecor.product_service.service;

import com.luxurydecor.product_service.entity.Product;
import com.luxurydecor.product_service.entity.Review;
import com.luxurydecor.product_service.repository.ProductRepository;
import com.luxurydecor.product_service.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    /**
     * Hàm chính: Gợi ý N sản phẩm cho một User cụ thể
     */
    public List<Product> getRecommendationsForUser(Integer targetAccountId, int topN) {
        List<Review> allReviews = reviewRepository.findAll();

        // Ma trận Dữ liệu
        // Map<ProductId, Map<AccountId, Rating>>
        Map<Integer, Map<Integer, Integer>> itemUserMatrix = new HashMap<>();
        // Map<AccountId, Map<ProductId, Rating>>
        Map<Integer, Map<Integer, Integer>> userItemMatrix = new HashMap<>();

        for (Review review : allReviews) {
            Integer pId = review.getProduct().getProductId();
            Integer aId = review.getAccountId();
            Integer rating = review.getRating();

            itemUserMatrix.computeIfAbsent(pId, k -> new HashMap<>()).put(aId, rating);
            userItemMatrix.computeIfAbsent(aId, k -> new HashMap<>()).put(pId, rating);
        }

        // Lấy danh sách sản phẩm mà Target User đã đánh giá
        Map<Integer, Integer> targetUserRatings = userItemMatrix.getOrDefault(targetAccountId, Collections.emptyMap());

        // XỬ LÝ COLD START PROBLEM (Người dùng mới chưa mua/đánh giá gì)
        if (targetUserRatings.isEmpty()) {
            log.info("User {} chưa có lịch sử, chuyển sang gợi ý mặc định", targetAccountId);
            return getFallbackRecommendations(topN);
        }

        // Tính toán điểm dự đoán cho các sản phẩm User CHƯA đánh giá
        Map<Integer, Double> predictedRatings = new HashMap<>();

        for (Integer candidateProductId : itemUserMatrix.keySet()) {
            // Bỏ qua nếu user đã đánh giá sản phẩm này rồi
            if (targetUserRatings.containsKey(candidateProductId)) continue;

            double numerator = 0.0;
            double denominator = 0.0;
            Map<Integer, Integer> candidateRatings = itemUserMatrix.get(candidateProductId);

            // Duyệt qua các sản phẩm User ĐÃ đánh giá để so sánh với Candidate
            for (Map.Entry<Integer, Integer> ratedEntry : targetUserRatings.entrySet()) {
                Integer ratedProductId = ratedEntry.getKey();
                Integer userRatingGiven = ratedEntry.getValue();

                Map<Integer, Integer> ratedProductRatings = itemUserMatrix.get(ratedProductId);

                // Tính độ tương đồng Cosine giữa 2 sản phẩm
                double similarity = calculateCosineSimilarity(candidateRatings, ratedProductRatings);

                // Chỉ lấy những sản phẩm có độ tương đồng dương
                if (similarity > 0) {
                    numerator += similarity * userRatingGiven;
                    denominator += similarity;
                }
            }

            // Lưu điểm dự đoán (Predicted Rating)
            if (denominator > 0) {
                predictedRatings.put(candidateProductId, numerator / denominator);
            }
        }

        // Sắp xếp các sản phẩm theo điểm dự đoán giảm dần
        List<Map.Entry<Integer, Double>> sortedPredictions = new ArrayList<>(predictedRatings.entrySet());
        sortedPredictions.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));

        // Lấy ID của Top N sản phẩm tốt nhất và query ra Product thật
        List<Integer> topProductIds = sortedPredictions.stream()
                .limit(topN)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        return productRepository.findAllById(topProductIds);
    }

    /**
     * Hàm tính Toán học: Độ tương đồng Cosine (Cosine Similarity)
     * Công thức: (A . B) / (||A|| * ||B||)
     */
    private double calculateCosineSimilarity(Map<Integer, Integer> ratingsA, Map<Integer, Integer> ratingsB) {
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (Map.Entry<Integer, Integer> entryA : ratingsA.entrySet()) {
            Integer userId = entryA.getKey();
            double ratingA = entryA.getValue();

            normA += Math.pow(ratingA, 2);

            // Nếu user này cũng rate sản phẩm B -> Tính tích vô hướng
            if (ratingsB.containsKey(userId)) {
                double ratingB = ratingsB.get(userId);
                dotProduct += ratingA * ratingB;
            }
        }

        for (Integer ratingB : ratingsB.values()) {
            normB += Math.pow(ratingB, 2);
        }

        if (normA == 0.0 || normB == 0.0) return 0.0;

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Fallback cho User mới (Cold Start): Trả về các sản phẩm có Stock cao nhất / Bán chạy nhất
     */
    private List<Product> getFallbackRecommendations(int topN) {
        // mượn hàm High Stock đã viết lúc trước
        // tạo hàm "findTopNByOrderByQuantitySoldDesc" trong ProductRepository để lấy hàng bán chạy
        return productRepository.findByStockQuantityLessThanOrderByStockQuantityAsc(10);
    }
}
