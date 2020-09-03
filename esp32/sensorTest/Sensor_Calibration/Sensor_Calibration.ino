#include <driver/adc.h>


const int potPin = 36;
const int sensorPowerPin = 25;

int potValue = 0;
int humVal = 0;


int wetValue = 1200;//to wet
int dryValue = 3100;//to dry
//perfect = 1300


void setup() {

adc1_config_width(ADC_WIDTH_BIT_12);

//adc1_config_channel_atten(ADC1_CHANNEL_4,ADC_ATTEN_DB_0); //ADC1_CHANNEL_4 = pin 32
//adc1_config_channel_atten(ADC1_CHANNEL_5,ADC_ATTEN_DB_0);
//pinMode(ADC1_CHANNEL_4, INPUT_PULLDOWN);
//pinMode(ADC1_CHANNEL_5, INPUT_PULLDOWN);
pinMode(LED_BUILTIN, OUTPUT);
pinMode(sensorPowerPin, OUTPUT);
   

  Serial.begin(115200);
  delay(1000);
}

void loop() {
  // Reading potentiometer value
  digitalWrite(LED_BUILTIN, HIGH);
  digitalWrite(sensorPowerPin, HIGH);
  delay(500);
  potValue = analogRead(potPin);
  if(potValue < 500)potValue = 4000;
  //Serial.print("analog val: ");
  Serial.println(potValue);
  
  //humVal = map(potValue, dryValue, wetValue, 1, 99);
  humVal = map(potValue, 3100, 1100, 1, 99);
  //Serial.println(potValue);
  Serial.println(humVal);
  delay(500);
    digitalWrite(LED_BUILTIN, LOW);
  digitalWrite(sensorPowerPin, LOW);

  delay(1000);
  //                                                                                             digitalWrite(testpin, LOW);

}
