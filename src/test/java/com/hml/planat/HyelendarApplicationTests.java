package com.hml.planat;

import com.hml.planat.entities.weather.WeatherEntity;
import com.hml.planat.services.WeatherService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.*;

@SpringBootTest
class HyelendarApplicationTests {
    @Autowired
    private WeatherService weatherService;

    @Test
    void contextLoads() throws IOException {
        WeatherEntity[] weathers = this.weatherService.getHourlyByCoordinate(35.8703D, 128.5911D);
        for (WeatherEntity weather : weathers) {
            System.out.printf("%s: 온도는 %f도, 습도는 %d 일껄?\n", weather.getTimestamp(), weather.getTemperatureMax(), weather.getHumidity());
        }
    }

}
