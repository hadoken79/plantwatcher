#include "WiFi.h" // ESP32 WiFi include
#include "WiFiConf.h" // My WiFi configuration, placed in libaries (eg. home/[yourUser]/arduino-1.8.13-linux64/arduino-1.8.13/libraries/Configuration/WiFiConf.h)
#include <driver/adc.h>
/* WiFiConf.h
 * const char *SSID = "Your SSID";
 * const char *WiFiPassword = "Your Password";
 */
#include <HTTPClient.h>
#include <time.h>


//RTC memory is keepts during deepsleep
//RTC_DATA_ATTR int bootCount = 0; //even if just declared, power will stay switched on, even when defined of in sleep configuration

//init vars
const int plant_1_pin = 32; // = ADC1_CHANNEL 4. analog pin for reading values. needs to be a ADC1 pin. ADC2 ports are blocked when wifi is used!. multiple plants could be messured with one mc. varnumber represents plantId
const int bat_pin = 33; // = ADC1_CHANNEL 5
const int sensorPowerPin = 25;
  int potValue;
  int humVal;
  int tries;
  bool debug = true; //toggle Serialoutput for debuging
  //char api[] = "http://jsonplaceholder.typicode.com/posts";
  char api[] = "http://192.168.0.74/api/postReadings";
  //reference values for specific sensor
  int maxWetValue = 1100; 
  int maxDryValue = 2000;


  
void setup() {
      //adc1_config_channel_atten(ADC1_CHANNEL_4,ADC_ATTEN_DB_0);//no voltage reduction on pin for this sensor
      //adc1_config_channel_atten(ADC1_CHANNEL_5,ADC_ATTEN_DB_0);//11 = max voltage reduction 
      //bootCount ++;
     pinMode(ADC1_CHANNEL_4, INPUT_PULLDOWN);
     pinMode(ADC1_CHANNEL_5, INPUT_PULLDOWN);
     resetVals();
     Serial.begin(115200);
     delay(500);
     Serial.println("booting...");
     //Serial.print("bootcount: ");
     //Serial.println(bootCount);
      
      //DeepSleep Confuguration for hibernate even shut down rtc memory if not needed
          esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_SLOW_MEM, ESP_PD_OPTION_OFF);
          esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_FAST_MEM, ESP_PD_OPTION_OFF);
          esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_PERIPH, ESP_PD_OPTION_OFF);
          //esp_sleep_enable_timer_wakeup(21600e6);6h
          esp_sleep_enable_timer_wakeup(20e6);//testduration
}

void loop() {

   if(ConnectToWiFi()){
    //setSystemTime(); <--currently not needed, server will add time when storing messures
    
    sendData(api,1, messureHumidity(plant_1_pin));// <--- repeat for every plant with corresponding pin and PlantId (matches number in pinvariable)
    //eg sendData(api, ,2, messureHumidity(plant_2_pin));
    
    WiFi.disconnect();
    if(debug)Serial.println("going to take a nap");
     esp_deep_sleep_start();
   }else{
    if(debug)Serial.println("failed to connect to wifi");
        //go back to sleep and try next time
        if(debug)Serial.println("going to take a nap");
         esp_deep_sleep_start();
   }

}


bool ConnectToWiFi()
{
 
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, WiFiPassword);
    if(debug){
      Serial.print("Connecting to ");
      Serial.println(SSID);
    }
      
  uint8_t i = 0;
  while (WiFi.status() != WL_CONNECTED)
  {
      if(debug) Serial.print('.');
       
    delay(500);
 
    if ((++i % 16) == 0)
    {
        //if(debug)Serial.println(F(" still trying to connect"));   
        return false;
    }
  }
   if(debug){
    Serial.print(F("Connected. My IP address is: "));
    Serial.println(WiFi.localIP());
   }
  return true;
}

int messureHumidity(int potPin){

  //set voltage to pin
  digitalWrite(sensorPowerPin, HIGH);
  delay(2000);
  potValue = analogRead(potPin);
  
  //unset voltage
  digitalWrite(sensorPowerPin, LOW);//shut power to sensor of
  humVal = map(potValue, maxDryValue, maxWetValue, 1, 99);

  
  if(humVal > 99)
    humVal = 99;

  if(humVal < 1)
    humVal = 1;
  
  if(debug){
  Serial.println(potValue);
  }
  return humVal;
}

bool sendData(char api[],int plantId, int val){
  if(debug)Serial.print("sending data ");
  if(debug)Serial.println(val);

   int batterieLevel = powerCheck();
   
  HTTPClient http;

        
        http.begin(api);
        http.addHeader("Content-Type", "application/json");

        if(debug)Serial.print("[HTTP] POST...\n");
        
        // start connection and send HTTP header
        int httpResponseCode = http.POST("{\"plantId\": " + String(plantId) + ", \"hum\": " + String(val) + ", \"power\": " + String(batterieLevel) + "}"); //Send the actual POST request as json


        // httpCode will be negative on error
        if(httpResponseCode > 0) {
          
               // HTTP header has been send and Server response header has been handled
               if(debug)Serial.printf("[HTTP] POST responsecode: %d\n", httpResponseCode);
               String response = http.getString();
               if(debug)Serial.println(response);
              

               //process answer
            
        } else {
            if(debug)Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
            delay(500);
            if(tries++ < 2)sendData(api, plantId, val);//retry 2 more times in case of error
            resetVals();
            return false;
        }

        http.end();
        resetVals();
        return true;
}
//currently not needed, server sets time when storing readings in db
void setSystemTime(){
  
  struct tm timeinfo;

  const char* ntpServer = "pool.ntp.org";
  const long  gmtOffset_sec = 3600;
  const int   daylightOffset_sec = 3600;

  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

  getLocalTime(&timeinfo);

  Serial.println(&timeinfo, "%A, %B %d %Y %H:%M:%S");
  
  Serial.print("Day of week: ");
  Serial.println(&timeinfo, "%A");
  Serial.print("Month: ");
  Serial.println(&timeinfo, "%B");
  Serial.print("Day of Month: ");
  Serial.println(&timeinfo, "%d");
  Serial.print("Year: ");
  Serial.println(&timeinfo, "%Y");
  Serial.print("Hour: ");
  Serial.println(&timeinfo, "%H");
  Serial.print("Hour (12 hour format): ");
  Serial.println(&timeinfo, "%I");
  Serial.print("Minute: ");
  Serial.println(&timeinfo, "%M");
  Serial.print("Second: ");
  Serial.println(&timeinfo, "%S");  
}

void resetVals(){
      potValue = 0;
      humVal = 0;
      tries = 0;
}

int powerCheck(){
  int bat = (map(analogRead(bat_pin), 2000, 4095, 0, 100));
  if(debug){
    Serial.print("batterieLevel ");
    Serial.println(bat);
  }
  return bat;
}
