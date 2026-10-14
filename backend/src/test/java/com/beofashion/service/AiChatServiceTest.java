package com.beofashion.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.beofashion.dto.AiChatRequest;
import com.beofashion.dto.AiChatResponse;
import com.beofashion.entity.Category;
import com.beofashion.entity.Gender;
import com.beofashion.entity.Product;
import com.beofashion.entity.ProductVariant;
import com.beofashion.repository.CouponRepository;
import com.beofashion.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiChatServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CouponRepository couponRepository;

    private AiChatService aiChatService;

    @BeforeEach
    void setUp() {
        aiChatService = new AiChatService(productRepository, couponRepository, new ObjectMapper());
        ReflectionTestUtils.setField(aiChatService, "geminiApiKey", "");
        ReflectionTestUtils.setField(aiChatService, "model", "gemini-3.5-flash");
    }

    @Test
    void understandsVietnameseMeasurementsWhenInterfaceLanguageIsEnglish() {
        AiChatResponse response = aiChatService.chat(new AiChatRequest(
                "nặng 60 kg cao 160cm",
                "en",
                List.of()
        ));

        assertThat(response.reply())
                .contains("160 cm", "60 kg", "size M", "size L");
        assertThat(response.aiEnabled()).isFalse();
        assertThat(response.fallbackUsed()).isTrue();
    }

    @Test
    void prioritizesExchangeIntentOverGenericSizeAdvice() {
        AiChatResponse response = aiChatService.chat(new AiChatRequest(
                "Mình muốn đổi size thì cần làm gì?",
                "en",
                List.of()
        ));

        assertThat(response.reply()).contains("30 ngày", "thông tin đơn hàng");
    }

    @Test
    void answersEnglishWhenVietnameseInterfaceReceivesEnglishQuestion() {
        AiChatResponse response = aiChatService.chat(new AiChatRequest(
                "Can you suggest a size for height 160cm and weight 60kg?",
                "vi",
                List.of()
        ));

        assertThat(response.reply())
                .startsWith("At 160 cm and 60 kg")
                .contains("size M", "size L");
    }

    @Test
    void understandsVietnameseWithoutDiacriticsOnEnglishInterface() {
        AiChatResponse response = aiChatService.chat(new AiChatRequest(
                "tu van size cho minh, cao 160cm nang 60kg",
                "en",
                List.of()
        ));

        assertThat(response.reply())
                .startsWith("Với chiều cao 160 cm")
                .contains("size M", "size L");
    }

    @Test
    void rejectsRepliesThatExposeInternalStoreContext() {
        Boolean exposesContext = ReflectionTestUtils.invokeMethod(
                aiChatService,
                "exposesInternalContext",
                "ACTIVE PRODUCT CATALOG: Lists items, prices, collections, materials."
        );

        assertThat(exposesContext).isTrue();
    }

    @Test
    void answersProductQuestionsFromTheLiveCatalogWithoutCallingGemini() {
        Product product = Product.builder()
                .name("French Terry Relaxed Crew Neck Sweatshirt")
                .gender(Gender.MEN)
                .category(Category.builder().name("Men Tops").slug("men-tops").gender(Gender.MEN).build())
                .collection("Sweat Collection")
                .material("100% Cotton")
                .basePrice(new BigDecimal("599000"))
                .variants(List.of(
                        ProductVariant.builder().colorName("09 BLACK").size("M").totalStock(12).active(true).build(),
                        ProductVariant.builder().colorName("03 GRAY").size("L").totalStock(8).active(true).build()
                ))
                .build();
        when(productRepository.findByActiveTrue()).thenReturn(List.of(product));

        AiChatResponse response = aiChatService.chat(new AiChatRequest(
                "Áo French Terry có màu và size nào?",
                "vi",
                List.of()
        ));

        assertThat(response.provider()).isEqualTo("BEO Live Catalog");
        assertThat(response.reply()).contains("French Terry", "09 BLACK", "03 GRAY", "M", "L", "599000 VND");
        assertThat(response.aiEnabled()).isFalse();
    }
}
