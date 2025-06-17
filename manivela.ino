// scripts/arduino_motor/arduino_motor.ino

// Pino onde o motor (gerador) está conectado
const int SENSOR_PIN = A0; 

// Limiar de tensão para considerar que está girando.
// Você precisará ajustar este valor! Gire o motor e veja
// os valores no Serial Monitor para encontrar um bom limiar.
const int THRESHOLD = 5;

// Tempo de estabilização (em milissegundos) antes de mudar o estado
const int STABILIZATION_TIME = 1000;

// Variável para guardar o estado atual da manivela (0 = parado, 1 = girando)
int currentState = 0;
// Variável para guardar o último estado enviado
int lastState = 0;

// Variável para armazenar o tempo da última leitura estável
unsigned long lastStableTime = 0;

void setup() {
  // Inicia a comunicação serial a 9600 bps
  Serial.begin(9600); 
}

void loop() {
  // Lê o valor do pino analógico
  int sensorValue = analogRead(SENSOR_PIN);

  // Determina o novo estado com base no limiar
  int newState = (sensorValue > THRESHOLD) ? 1 : 0;

  // Se o novo estado for diferente do estado atual
  if (newState != currentState) {
    // Verifica se o tempo de estabilização foi atingido
    unsigned long currentTime = millis();
    if (currentTime - lastStableTime >= STABILIZATION_TIME) {
      // Atualiza o estado apenas se o tempo de estabilização foi respeitado
      currentState = newState;
      lastStableTime = currentTime; // Atualiza o tempo da última mudança estável
    }
  } else {
    // Se o estado não mudou, atualiza o tempo da última leitura estável
    lastStableTime = millis();
  }

  // Envia o novo estado pela serial APENAS se ele mudou
  if (currentState != lastState) {
    Serial.println(currentState);
    lastState = currentState; // Atualiza o último estado enviado
  }

  // Pequeno delay para estabilidade
  delay(100); 
}