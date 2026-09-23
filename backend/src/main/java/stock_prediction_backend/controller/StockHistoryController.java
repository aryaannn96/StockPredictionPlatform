package stock_prediction_backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "http://localhost:5173")
public class StockHistoryController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/{symbol}")
    public String getHistory(@PathVariable String symbol) {

        String url = "http://127.0.0.1:5000/history/"
                + symbol.toUpperCase();

        return restTemplate.getForObject(url, String.class);
    }
}