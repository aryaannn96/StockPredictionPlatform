package stock_prediction_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import stock_prediction_backend.entity.StockPrice;
import stock_prediction_backend.service.StockPriceService;

@RestController
@RequestMapping("/api/prices")
@CrossOrigin(origins = "http://localhost:5173")
public class StockPriceController {

    private final StockPriceService stockPriceService;

    public StockPriceController(StockPriceService stockPriceService) {
        this.stockPriceService = stockPriceService;
    }

    // Get all historical prices
    @GetMapping
    public List<StockPrice> getAllPrices() {
        return stockPriceService.getAllPrices();
    }

    // Get historical prices for a particular stock
    @GetMapping("/{symbol}")
    public List<StockPrice> getPricesBySymbol(@PathVariable String symbol) {
        return stockPriceService.getPricesBySymbol(symbol);
    }

    // Add one price record
    @PostMapping
    public StockPrice addPrice(@RequestBody StockPrice stockPrice) {
        return stockPriceService.savePrice(stockPrice);
    }

    // Add multiple price records
    @PostMapping("/bulk")
    public List<StockPrice> addPrices(@RequestBody List<StockPrice> prices) {
        return stockPriceService.saveAllPrices(prices);
    }

    // Delete a price record
    @DeleteMapping("/{id}")
    public String deletePrice(@PathVariable Long id) {
        stockPriceService.deletePrice(id);
        return "Stock price deleted successfully";
    }
}