import { AfterViewChecked, Component, ElementRef, Renderer2, input, viewChild,signal, OnDestroy} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Content } from '../../../../core/models/content.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Component({
  selector: 'app-content-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './content-detail.component.html',
  styleUrl: './content-detail.component.scss',
})
export class ContentDetailComponent implements AfterViewChecked, OnDestroy {
  readonly content = input.required<Content>();
  readonly backLink = input.required<string>();
  readonly backLabel = input.required<string>();

  private readonly contentBody = viewChild<ElementRef<HTMLDivElement>>('contentBody');

  readonly isReading = signal(false);
  private utterance: SpeechSynthesisUtterance | null = null;

  constructor(
    private readonly renderer: Renderer2,
    private readonly sanitizer: DomSanitizer,
  ) {}

  ngAfterViewChecked(): void {
    this.enhanceCodeBlocks();
  }

  safeContentHtml(content: Content): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content.content_html ?? '');
  }

  bestDate(content: Content): string | null {
    return content.published_at ?? content.scheduled_at ?? content.updated_at ?? content.created_at;
  }

  private enhanceCodeBlocks(): void {
    const body = this.contentBody()?.nativeElement;

    if (!body) {
      return;
    }

    const blocks = body.querySelectorAll('pre, .ql-syntax, .ql-code-block-container');

    blocks.forEach((block) => {
      const pre = block as HTMLElement;

      if (pre.dataset['copyEnhanced'] === 'true') {
        return;
      }

      pre.dataset['copyEnhanced'] = 'true';
      this.renderer.addClass(pre, 'code-block-enhanced');

      const button = this.renderer.createElement('button') as HTMLButtonElement;
      this.renderer.setAttribute(button, 'type', 'button');
      this.renderer.addClass(button, 'copy-code-btn');
      this.renderer.setProperty(button, 'textContent', 'Copiar código');

      this.renderer.listen(button, 'click', () => {
        void this.handleCopy(pre, button);
      });

      this.renderer.appendChild(pre, button);
    });
  }

  private extractCodeText(pre: HTMLElement): string {
    const clone = pre.cloneNode(true) as HTMLElement;
    const copyButton = clone.querySelector('.copy-code-btn');
    copyButton?.remove();
    return clone.innerText;
  }

  private async handleCopy(pre: HTMLElement, button: HTMLButtonElement): Promise<void> {
    const text = this.extractCodeText(pre);
    const copied = await this.copyToClipboard(text);

    if (!copied) {
      return;
    }

    this.renderer.setProperty(button, 'textContent', 'Copiado');
    setTimeout(() => {
      this.renderer.setProperty(button, 'textContent', 'Copiar código');
    }, 1300);
  }

  private async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      const textArea = this.renderer.createElement('textarea') as HTMLTextAreaElement;
      this.renderer.setStyle(textArea, 'position', 'fixed');
      this.renderer.setStyle(textArea, 'opacity', '0');
      this.renderer.setProperty(textArea, 'value', text);
      this.renderer.appendChild(document.body, textArea);
      textArea.select();
      const success = document.execCommand('copy');
      this.renderer.removeChild(document.body, textArea);
      return success;
    } catch {
      return false;
    }
  }


  // --- Lectura ---

toggleReading(): void {
  const speech = globalThis.speechSynthesis;

  if (!speech) {
    globalThis.alert('Tu navegador no soporta lectura de texto.');
    return;
  }

  if (this.isReading()) {
    speech.cancel();
    this.isReading.set(false);
    return;
  }

  const text = this.getReadableText();

  if (!text) {
    globalThis.alert('No hay contenido para leer.');
    return;
  }

  speech.cancel();

  this.utterance = new SpeechSynthesisUtterance(text);
  this.utterance.lang = 'es-ES';
  this.utterance.rate = 0.95;
  this.utterance.pitch = 1;

  this.utterance.onend = () => this.isReading.set(false);
  this.utterance.onerror = () => this.isReading.set(false);

  this.isReading.set(true);
  speech.speak(this.utterance);
}

  ngOnDestroy(): void {
    globalThis.speechSynthesis?.cancel();
  }

  private getReadableText(): string {
    const title = this.content().title ?? '';
    const description = this.content().short_description ?? '';
    const bodyElement = this.contentBody()?.nativeElement;

    if (!bodyElement) {
      return `${title}. ${description}`.replace(/\s+/g, ' ').trim();
    }

    const clone = bodyElement.cloneNode(true) as HTMLElement;

    clone.querySelectorAll('img').forEach((element) => {
      element.replaceWith(this.createReadableNotice('Aquí hay una imagen.'));
    });

    clone.querySelectorAll('iframe, video, .ql-video').forEach((element) => {
      element.replaceWith(this.createReadableNotice('Aquí hay un vídeo.'));
    });

    clone
      .querySelectorAll('pre, code, .ql-syntax, .ql-code-block-container, .ql-code-block')
      .forEach((element) => {
        element.replaceWith(this.createReadableNotice('Aquí hay un bloque de código.'));
      });

    clone.querySelectorAll('.copy-code-btn, svg, canvas').forEach((element) => {
      element.remove();
    });

    const bodyText = clone.innerText ?? '';

    return `${title}. ${description}. ${bodyText}`
      .replace(/\s+/g, ' ')
      .trim();
  }

  private createReadableNotice(text: string): HTMLElement {
    const span = document.createElement('span');
    span.textContent = ` ${text} `;
    return span;
  }
}
