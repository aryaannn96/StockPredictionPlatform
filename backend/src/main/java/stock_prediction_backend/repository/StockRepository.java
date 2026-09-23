package stock_prediction_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import stock_prediction_backend.entity.Stock;

public interface StockRepository extends JpaRepository<Stock, Long> {
}