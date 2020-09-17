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
const int plant_1_pin = 36; // = Needs to be a ADC1 pin. ADC2 ports are blocked when wifi is used!. multiple plants could be messured with one mc. varnumber represents plantId
const int bat_pin = 34;
const int sensorPowerPin = 25;

  int potValue;
  int humVal;
  int tries;
  

  char api[] = "http://192.168.0.74/api/postReadings";
  
  //reference values for specific sensor (capacitive soil moisture sensor, seems to workk best)
  int maxWetValue = 1200; 
  int maxDryValue = 3000;


  
void setup() {

      //bootCount ++;
     //pinMode(ADC1_CHANNEL_4, INPUT_PULLDOWN);
     //pinMode(ADC1_CHANNEL_5, INPUT_PULLDOWN);
     
     pinMode(LED_BUILTIN, OUTPUT);
     digitalWrite(LED_BUILTIN, LOW);//shutdown internal led to safe power
     pinMode(sensorPowerPin, OUTPUT);//only toggle voltage directly before taking messure
  
     resetVals();
     //Serial.begin(115200);
     //delay(300);
     
     //Serial.println("booting...");
     //Serial.print("bootcount: ");
     //Serial.println(bootCount);
      
      //DeepSleep Confuguration for hibernate even shut down rtc memory if not needed
          esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_SLOW_MEM, ESP_PD_OPTION_OFF);
          esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_FAST_MEM, ESP_PD_OPTION_OFF);
          esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_PERIPH, ESP_PD_OPTION_OFF);
          esp_sleep_enable_timer_wakeup(21600e6);//6h
          //esp_sleep_enable_timer_wakeup(3600e6);//testduration
}

void loop() {

   if(ConnectToWiFi()){
    //setSystemTime(); <--currently not needed, server will add time when storing messures
    
    sendData(api,1, messureHumidity(plant_1_pin));// <--- repeat for every plant with corresponding pin and PlantId (matches number in pinvariable)
    //eg sendData(api, ,2, messureHumidity(plant_2_pin));
    
    WiFi.disconnect();
    //Serial.println("going to take a nap");
     esp_deep_sleep_start();
   }else{
    //Serial.println("failed to connect to wifi");
        //go back to sleep and try next time
        //Serial.println("going to take a nap");
         esp_deep_sleep_start();
   }

}


bool ConnectToWiFi()
{
 
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, WiFiPassword);

      //Serial.print("Connecting to ");
      //Serial.println(SSID);

      
  uint8_t i = 0;
  while (WiFi.status() != WL_CONNECTED)
  {
    //Serial.print('.'); 
    delay(500);
 
    if ((++i % 16) == 0)
    {
        //Serial.println(F(" still trying to connect"));   
        return false;
    }
  }
    //Serial.print(F("Connected. My IP address is: "));
    //Serial.println(WiFi.localIP());
   
  return true;
}

int messureHumidity(int potPin){

    //power up messure pin
    digitalWrite(LED_BUILTIN, HIGH);//for some fucked up reason, sensor reads lower values when led not pulled high bevor reading.....
    digitalWrite(sensorPowerPin, HIGH);
    delay(300);
    potValue = analogRead(potPin);
  
    if(potValue < 950)potValue = 4000;//in case of voltage drop messure 0 

  
  //translate value to readable range
  humVal = map(potValue, maxDryValue, maxWetValue, 1, 99);

  //limit values outside of defined range (gauge in frontend has range of 1-99)
  if(humVal > 99)
    humVal = 99;

  if(humVal < 1)
    humVal = 1;
    
    //powerof pin
  digitalWrite(sensorPowerPin, LOW);
  digitalWrite(LED_BUILTIN, LOW);

  
  return humVal;
}

bool sendData(char api[],int plantId, int val){
  //Serial.print("sending data ");
  //Serial.println(val);

   int batterieLevel = powerCheck();
   
  HTTPClient http;

        
        http.begin(api);
        http.addHeader("Content-Type", "application/json");

        //Serial.print("[HTTP] POST...\n");
        
        // start connection and send HTTP message
        int httpResponseCode = http.POST("{\"plantId\": " + String(plantId) + ", \"hum\": " + String(val) + ", \"power\": " + String(batterieLevel) + "}"); //Send the actual POST request as json


        // httpCode will be negative on error
        if(httpResponseCode > 0) {
          
               // HTTP header has been send and Server response header has been handled
               //Serial.printf("[HTTP] POST responsecode: %d\n", httpResponseCode);
               String response = http.getString();
               //Serial.println(response);
              
            
        } else {
            //Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
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
  Serial.print("batraw");
  Serial.println(analogRead(bat_pin));
  int bat = (map(analogRead(bat_pin), 2000, 4095, 0, 100));//needs to be calibrated for every powersource and corresponding voltage

    Serial.print("batteryLevel ");
    Serial.println(bat);
  
  return bat;
}
