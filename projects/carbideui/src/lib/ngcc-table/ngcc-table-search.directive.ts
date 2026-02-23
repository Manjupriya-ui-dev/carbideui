import { Directive, ElementRef, inject, effect } from '@angular/core';
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgccTableSearchService } from './ngcc-table-search.service';

@Directive({
  selector: '[ngccTableSearch]',
  standalone: true,
})
export class NgccTableSearchDirective {
  private readonly el = inject(ElementRef<HTMLInputElement>);
  private readonly search = inject(NgccTableSearchService);

  constructor() {
    effect(() => {
      fromEvent<Event>(this.el.nativeElement, 'input')
        .pipe(map((e) => (e.target as HTMLInputElement).value))
        .subscribe((val) => this.search.query.set(val));
    });
  }
}
