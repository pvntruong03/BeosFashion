package com.uniqlo.clone.service;

import com.uniqlo.clone.dto.StoreDto;
import com.uniqlo.clone.entity.Store;
import com.uniqlo.clone.exception.ResourceNotFoundException;
import com.uniqlo.clone.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;

    @Transactional(readOnly = true)
    public List<StoreDto> getAllActiveStores() {
        return storeRepository.findByActiveTrue().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StoreDto getStoreById(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));
        return mapToDto(store);
    }

    public StoreDto mapToDto(Store store) {
        return StoreDto.builder()
                .id(store.getId())
                .code(store.getCode())
                .name(store.getName())
                .address(store.getAddress())
                .city(store.getCity())
                .phone(store.getPhone())
                .openingHours(store.getOpeningHours())
                .latitude(store.getLatitude())
                .longitude(store.getLongitude())
                .imageUrl(store.getImageUrl())
                .isCentralWarehouse(store.isCentralWarehouse())
                .active(store.isActive())
                .build();
    }
}
