#include <driver/adc.h>


const int potPin = 32;

int potValue = 0;
int humVal = 0;

int testpin = 5;

int wetValue = 200;//to wet
int dryValue = 1000;//to dry


void setup() {

adc1_config_width(ADC_WIDTH_BIT_12);

//adc1_config_channel_atten(ADC1_CHANNEL_4,ADC_ATTEN_DB_0); //ADC1_CHANNEL_4 = pin 32
//adc1_config_channel_atten(ADC1_CHANNEL_5,ADC_ATTEN_DB_0);
pinMode(ADC1_CHANNEL_4, INPUT_PULLDOWN);
pinMode(ADC1_CHANNEL_5, INPUT_PULLDOWN);
   

  Serial.begin(115200);
  delay(1000);
}

void loop() {
  // Reading potentiometer value
  digitalWrite(testpin, HIGH);
  potValue = analogRead(potPin);
  //Serial.print("analog val: ");
  Serial.println(potValue);
  
  //humVal = map(potValue, dryValue, wetValue, 1, 99);
  //humVal = map(potValue, 4095, 0, 1, 99);
  //Serial.println(potValue);
  //Serial.println(humVal);

  delay(1000);
  //                                                                                             digitalWrite(testpin, LOW);
    delay(1000);

}
