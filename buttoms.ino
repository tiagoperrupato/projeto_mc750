// Sketch para ler 6 botões em uma única porta analógica e enviar via serial

void setup() {
  // Inicia a comunicação serial a 9600 bps
  Serial.begin(9600);
}

void loop() {
  // Lê o valor da porta analógica A0
  int value = analogRead(A0);

  // Compara o valor lido para identificar qual botão foi pressionado
  // IMPORTANTE: Teste cada botão e ajuste estas faixas de valores!
  if (value >= 0 && value < 450) {
    Serial.println("Button1");
  } else if (value > 500 && value < 600) {
    Serial.println("Button2");
  } else if (value > 600 && value < 700) {
    Serial.println("Button3");
  } else if (value > 700 && value < 800) {
    Serial.println("Button4");
  } else if (value > 800 && value < 830) {
    Serial.println("Button5");
  } else if (value < 1000 && value > 840) { // Adicionado Botão 6
    Serial.println("Button6");
  }
  // Se nenhum botão estiver pressionado, o valor pode ser 0 ou muito baixo,
  // então não enviamos nada para não poluir a saída.

  // Um pequeno delay para estabilizar a leitura e não sobrecarregar o serial
  delay(200);
}