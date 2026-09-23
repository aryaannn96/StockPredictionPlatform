package stock_prediction_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import stock_prediction_backend.entity.StockPrice;

public interface StockPriceRepository extends JpaRepository<StockPrice, Long> {

    List<StockPrice> findBySymbolOrderByDateAsc(String symbol);
}