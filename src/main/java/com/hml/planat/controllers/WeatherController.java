package com.hml.planat.controllers;

import com.hml.planat.entities.weather.WeatherEntity;
import com.hml.planat.services.WeatherService;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value = "/weather")
public class WeatherController {
    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public WeatherEntity getIndex(@RequestParam(value = "latitude", required = false) double latitude,
                                     @RequestParam(value = "longitude", required = false) double longitude) {
        return this.weatherService.getCurrentByCoordinate(latitude, longitude);
    }

    @RequestMapping(value = "/hourly", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public WeatherEntity[] getHourly(@RequestParam(value = "latitude", required = false) double latitude,
                                    @RequestParam(value = "longitude", required = false) double longitude) {
        return this.weatherService.getHourlyByCoordinate(latitude, longitude);
    }

    @RequestMapping(value = "/daily", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public WeatherEntity[] getDaily(@RequestParam(value = "latitude", required = false) double latitude,
                                     @RequestParam(value = "longitude", required = false) double longitude) {
        return this.weatherService.getDailyByCoordinate(latitude, longitude);
    }
}
