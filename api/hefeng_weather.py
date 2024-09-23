from config import Config, HeFengWeather

import requests
import json


def get_weather(city: str) -> str:
    location_id = get_location_id(city)
    requests_url = f"https://devapi.heweather.net/v7/weather/now?location={location_id}&key={HeFengWeather.API_KEY}"
    response = requests.get(requests_url)
    response_json = json.loads(response.text)
    weather = response_json['now']
    return weather

def get_location_id(city: str) -> str:
    requests_url = f"https://geoapi.heweather.net/v2/city/lookup?location={city}&key={HeFengWeather.API_KEY}"
    response = requests.get(requests_url)
    response_json = json.loads(response.text)
    location_id = response_json["location"][0]["id"]
    return location_id

if __name__ == "__main__":
    print(get_weather("上海"))