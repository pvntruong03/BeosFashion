package com.beofashion.service;

import com.beofashion.dto.LookbookDto;
import com.beofashion.dto.LookbookItemDto;
import com.beofashion.entity.Lookbook;
import com.beofashion.repository.LookbookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LookbookService {

    private final LookbookRepository lookbookRepository;

    @Transactional(readOnly = true)
    public List<LookbookDto> getActiveLookbooks() {
        List<Lookbook> lookbooks = lookbookRepository.findByActiveTrueOrderByCreatedAtDesc();
        return lookbooks.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private LookbookDto mapToDto(Lookbook lookbook) {
        List<LookbookItemDto> itemDtos = lookbook.getItems().stream()
                .map(item -> LookbookItemDto.builder()
                        .id(item.getProduct().getId())
                        .slug(item.getProduct().getSlug())
                        .name(item.getProduct().getName())
                        .price(item.getProduct().getBasePrice())
                        .color("Default")
                        .build())
                .collect(Collectors.toList());

        return LookbookDto.builder()
                .id(lookbook.getId())
                .title(lookbook.getTitle())
                .description(lookbook.getDescription())
                .mainImage(lookbook.getMainImage())
                .items(itemDtos)
                .build();
    }
}
