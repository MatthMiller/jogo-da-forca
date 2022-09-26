import * as rl from 'readline';
import * as fileSystem from 'fs/promises';

class JogoDaForca {
  private palavraSorteada!: string;
  private letrasInseridas: string[] = [];
  private progressoPalavra: string[] = [];
  private totalTentativas: number;
  private jogadorVenceu: boolean = false;

  constructor(tentativas: number) {
    this.totalTentativas = tentativas;
    this.inicializar();
  }

  async buscarPalavraSorteada(): Promise<void> {
    try {
      const dadosRaw: any = await fileSystem.readFile('palavras.json', 'utf-8');
      const dados: string[] = JSON.parse(dadosRaw);
      const indiceAleatorio: number = Math.floor(Math.random() * dados.length);
      this.palavraSorteada = dados[indiceAleatorio];
    } catch (erro) {
      console.log(erro);
    }
  }

  async loopPerguntas() {
    console.clear();
    const palavraInicial: string = this.palavraSorteada
      .split('')
      .map(() => '❓')
      .join('');
    console.log('Palavra:', palavraInicial);

    const readLine = rl.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    do {
      const letraInput: string = await new Promise((resolve) => {
        readLine.question('> Insira uma letra: ', resolve);
      });

      console.clear();
      this.atualizaProgresso(letraInput);

      if (this.jogadorVenceu) break;
    } while (this.totalTentativas > 0);

    this.mensagemFinal();
    readLine.close();
  }

  atualizaProgresso(letraInput: string): void {
    this.totalTentativas--;
    this.letrasInseridas.push(letraInput);
    this.progressoPalavra = this.palavraSorteada.split('').map((letraAtual) => {
      return this.letrasInseridas.includes(letraAtual.toUpperCase()) ||
        this.letrasInseridas.includes(letraAtual.toLowerCase())
        ? letraAtual
        : '❓';
    });
    console.log('Palavra:', this.progressoPalavra.join(''));
    console.log('Tentativas restantes: ', this.totalTentativas, '\n');

    // Checa se as arrays possuem valores idênticos
    if (
      this.progressoPalavra.every(
        (valor, index) => valor === this.palavraSorteada.split('')[index]
      )
    ) {
      this.jogadorVenceu = true;
    }
  }

  mensagemFinal(): void {
    const corEnfase = '\x1b[36m%s\x1b[0m';

    if (this.jogadorVenceu) {
      console.log(corEnfase, 'Parabéns, você venceu!');
    } else {
      console.log(corEnfase, ' Que pena... Boa sorte da próxima vez!');
      console.log(corEnfase, `A palavra era '${this.palavraSorteada}'`);
    }
  }

  async inicializar(): Promise<void> {
    await this.buscarPalavraSorteada();
    await this.loopPerguntas();
  }
}

new JogoDaForca(15);
