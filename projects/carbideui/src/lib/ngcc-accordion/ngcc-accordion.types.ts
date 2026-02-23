import { InjectionToken } from '@angular/core';

export type AccordionAlign = 'start' | 'end';
export type AccordionSize = 'sm' | 'md' | 'lg';

export const NGCC_ACCORDION_ALIGN = new InjectionToken<() => AccordionAlign>(
  'NGCC_ACCORDION_ALIGN',
);
