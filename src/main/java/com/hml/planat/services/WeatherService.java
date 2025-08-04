package com.hml.planat.services;

import com.hml.planat.entities.weather.WeatherEntity;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;


@Service
public class WeatherService {
    public WeatherEntity getCurrentByCoordinate(double latitude, double longitude) {
        WeatherEntity weather;
        try {
            String url = String.format("https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&timezone=Asia%%2FTokyo&current=temperature_2m,rain,snowfall,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=ms", latitude, longitude);
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            JSONObject responseObject = new JSONObject(response.body());
            JSONObject currentObject = responseObject.getJSONObject("current");
             weather = new WeatherEntity();
            weather.setTimestamp(LocalDateTime.parse(currentObject.getString("time"))); // ?
            weather.setLongitude(responseObject.getDouble("longitude"));
            weather.setLatitude(responseObject.getDouble("latitude"));
            weather.setTemperatureMax(currentObject.getDouble("temperature_2m"));
            weather.setTemperatureMin(currentObject.getDouble("temperature_2m"));
            weather.setRain(currentObject.getDouble("rain"));
            weather.setSnowfall(currentObject.getDouble("snowfall"));
            weather.setHumidity(currentObject.getInt("relative_humidity_2m"));
            weather.setWindSpeed(currentObject.getDouble("wind_speed_10m"));
            weather.setWeatherCode(currentObject.getInt("weather_code"));
        } catch (Exception e) {
            weather = null;
        }
        return weather;
    }

    public WeatherEntity[] getHourlyByCoordinate(double latitude, double longitude) {
        WeatherEntity[] weathers;
        try {
            String url = String.format("https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&timezone=Asia%%2FTokyo&hourly=temperature_2m,rain,snowfall,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=ms&forecast_days=1", latitude, longitude);
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            JSONObject responseObject = new JSONObject(response.body());
            JSONObject hourlyObject = responseObject.getJSONObject("hourly");
            JSONArray timeArray = hourlyObject.getJSONArray("time");
            JSONArray temperatureArray = hourlyObject.getJSONArray("temperature_2m");
            JSONArray rainArray = hourlyObject.getJSONArray("rain");
            JSONArray snowArray = hourlyObject.getJSONArray("snowfall");
            JSONArray humidityArray = hourlyObject.getJSONArray("relative_humidity_2m");
            JSONArray windArray = hourlyObject.getJSONArray("wind_speed_10m");
            JSONArray weatherCodeArray = hourlyObject.getJSONArray("weather_code");
            weathers = new WeatherEntity[timeArray.length()];
            for (int i = 0; i < weathers.length; i++) {
                WeatherEntity weather = new WeatherEntity();
                weather.setTimestamp(LocalDateTime.parse(timeArray.getString(i))); // ?
                weather.setLongitude(responseObject.getDouble("longitude"));
                weather.setLatitude(responseObject.getDouble("latitude"));
                weather.setTemperatureMax(temperatureArray.getDouble(i));
                weather.setRain(rainArray.getDouble(i));
                weather.setSnowfall(snowArray.getDouble(i));
                weather.setHumidity(humidityArray.getInt(i));
                weather.setWindSpeed(windArray.getDouble(i));
                weather.setWeatherCode(weatherCodeArray.getInt(i));
                weathers[i] = weather;
            }
        } catch (Exception e) {
            weathers = new WeatherEntity[0];
        }
        return weathers;
    }

    public WeatherEntity[] getDailyByCoordinate(double latitude, double longitude) {
        WeatherEntity[] weathers;
        try {
            String url = String.format("https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&timezone=Asia%%2FTokyo&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset", latitude, longitude);
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            JSONObject responseObject = new JSONObject(response.body());
            JSONObject dailyObject = responseObject.getJSONObject("daily");
            JSONArray timeArray = dailyObject.getJSONArray("time");
            JSONArray temperatureMaxArray = dailyObject.getJSONArray("temperature_2m_max");
            JSONArray temperatureMinArray = dailyObject.getJSONArray("temperature_2m_min");
            JSONArray weatherCodeArray = dailyObject.getJSONArray("weather_code");
            JSONArray sunriseArray = dailyObject.getJSONArray("sunrise");
            JSONArray sunsetArray = dailyObject.getJSONArray("sunset");
            weathers = new WeatherEntity[timeArray.length()];
            for (int i = 0; i < weathers.length; i++) {
                WeatherEntity weather = new WeatherEntity();
                weather.setTimestamp(LocalDateTime.parse(timeArray.getString(i) + "T00:00:00")); // ?
                weather.setLongitude(responseObject.getDouble("longitude"));
                weather.setLatitude(responseObject.getDouble("latitude"));
                weather.setTemperatureMax(temperatureMaxArray.getDouble(i));
                weather.setTemperatureMin(temperatureMinArray.getDouble(i));
                weather.setWeatherCode(weatherCodeArray.getInt(i));
                weather.setSunrise(LocalDateTime.parse(sunriseArray.getString(i)));
                weather.setSunset(LocalDateTime.parse(sunsetArray.getString(i)));
                weathers[i] = weather;
            }
        } catch (Exception e) {
            e.printStackTrace();
            weathers = new WeatherEntity[0];
        }
        return weathers;
    }
}
