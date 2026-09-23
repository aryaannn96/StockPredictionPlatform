package stock_prediction_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import stock_prediction_backend.entity.StockPrice;
import stock_prediction_backend.repository.StockPriceRepository;

@Service
public class StockPriceService {

    private final StockPriceRepository stockPriceRepository;

    public StockPriceService(StockPriceRepository stockPriceRepository) {
        this.stockPriceRepository = stockPriceRepository;
    }

    public List<StockPrice> getAllPrices() {
        return stockPriceRepository.findAll();
    }

    public List<StockPrice> getPricesBySymbol(String symbol) {
        return stockPriceRepository.findBySymbolOrderByDateAsc(symbol);
    }

    public StockPrice savePrice(StockPrice stockPrice) {
        return stockPriceRepository.save(stockPrice);
    }

    public List<StockPrice> saveAllPrices(List<StockPrice> prices) {
        return stockPriceRepository.saveAll(prices);
    }

    public void deletePrice(Long id) {
        stockPriceRepository.deleteById(id);
    }
}