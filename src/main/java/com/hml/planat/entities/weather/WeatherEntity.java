package com.hml.planat.entities.weather;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WeatherEntity {
    private LocalDateTime timestamp;
    private double latitude;
    private double longitude;
    private double temperatureMax;
    private double temperatureMin;
    private double rain;
    private double snowfall;
    private int humidity;
    private double windSpeed;
    private int weatherCode;
    private LocalDateTime sunrise;
    private LocalDateTime sunset;
}
